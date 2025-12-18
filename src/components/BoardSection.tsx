'use client';

import React, { useEffect, useMemo, useState } from "react";
import { getProjects } from "@/services/projectService";
import { getTasksByProject, updateTaskStatus } from "@/services/taskService";
import {
  Clock,
  Play,
  TestTube,
  CheckCircle,
  MoreVertical,
  Calendar,
  User,
  Flag,
  AlertCircle,
  Star,
  CheckSquare
} from "lucide-react";

type SimpleProject = { id: number; name: string };
type SimpleTask = {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null;
  status_title?: string | null;
  dueDate?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  type?: 'bug' | 'feature' | 'task' | 'improvement';
  assignedTo?: any;
  estimatedTime?: number;
};

const STATUS_KEYS = ["todo", "inProgress", "testing", "completed"] as const;
const STATUS_LABELS: Record<(typeof STATUS_KEYS)[number], string> = {
  todo: "To Do",
  inProgress: "Doing",
  testing: "Testing",
  completed: "Done",
};

export default function BoardSection() {
  const [projects, setProjects] = useState<SimpleProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<SimpleTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setError(null);
      try {
        const list = await getProjects();
        const mapped = list.map((p: any) => ({ id: Number(p.id), name: p.name })) as SimpleProject[];
        setProjects(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load projects");
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      setTasks([]);
      if (!selectedProjectId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getTasksByProject(Number(selectedProjectId));
        const t = (res as any)?.tasks ?? res;
        let arr: SimpleTask[] = Array.isArray(t) ? (t as SimpleTask[]) : [];

        // If no real tasks are returned, generate 5-6 dummy tasks for this project on the frontend only
        if (!arr.length) {
          const project = projects.find((p) => p.id === Number(selectedProjectId));
          const projectName = project?.name || `Project ${selectedProjectId}`;
          const dummyCount = 6;
          const priorities: SimpleTask["priority"][] = ["low", "medium", "high", "urgent"]; // cycle priorities

          arr = Array.from({ length: dummyCount }).map((_, index) => {
            const statusIndex = index % STATUS_KEYS.length;
            const statusKey = STATUS_KEYS[statusIndex];
            const now = new Date();
            const due = new Date(now.getTime() + (index + 1) * 24 * 60 * 60 * 1000);

            return {
              id: Number(`${selectedProjectId}${index + 1}`),
              title: `Demo Task ${index + 1} for ${projectName}`,
              description: `This is a demo ${statusKey} task for ${projectName}.`,
              status: statusKey,
              status_title: statusKey,
              dueDate: due.toISOString(),
              priority: priorities[index % priorities.length],
              type: index % 2 === 0 ? "feature" : "task",
              assignedTo: undefined,
              estimatedTime: (index + 1) * 2,
            };
          });
        }

        setTasks(arr);
      } catch (e: any) {
        setError(e?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [selectedProjectId, projects]);

  const normalizeStatus = (s?: string | null) => String(s || "todo").toLowerCase();

  const columns = useMemo(() => {
    const map: Record<(typeof STATUS_KEYS)[number], SimpleTask[]> = {
      todo: [],
      inProgress: [],
      testing: [],
      completed: [],
    };
    for (const task of tasks) {
      const s = normalizeStatus(task.status_title || task.status);
      if (s === "in-progress" || s === "inprogress" || s === "doing" || s === "progress") map.inProgress.push(task);
      else if (s === "testing") map.testing.push(task);
      else if (s === "done" || s === "completed" || s === "complete" || s === "finished") map.completed.push(task);
      else map.todo.push(task);
    }
    return map;
  }, [tasks]);

  const handleStatusChange = async (task: SimpleTask, next: (typeof STATUS_KEYS)[number]) => {
    try {
      await updateTaskStatus(task.id, next);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status_title: next } : t)));
    } catch (e) {
      alert("Failed to update task status");
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, task: SimpleTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: (typeof STATUS_KEYS)[number]) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status_title !== targetColumn) {
      await handleStatusChange(draggedTask, targetColumn);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Utility Functions
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-500 bg-green-500/20 border-green-500/30';
      default: return 'text-slate-500 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getTaskTypeIcon = (type?: string) => {
    switch (type) {
      case 'bug': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'feature': return <Star className="w-4 h-4 text-blue-400" />;
      case 'improvement': return <Flag className="w-4 h-4 text-purple-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Clock className="w-5 h-5 text-slate-400" />;
      case 'inProgress': return <Play className="w-5 h-5 text-blue-400" />;
      case 'testing': return <TestTube className="w-5 h-5 text-yellow-400" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  return (
    <div className="text-white">
      {/* Project Selection */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/30 rounded-2xl p-6 mb-8 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              Choose Project Board
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 text-white border border-indigo-500/40 rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400/60 transition-all duration-300 hover:border-indigo-400/60 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 shadow-lg backdrop-blur-sm"
            >
              <option value="" className="bg-slate-800 text-slate-300">Choose a project board to view tasks...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-800 text-white">{p.name}</option>
              ))}
            </select>
          </div>
          {selectedProjectId && (
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Total Tasks</span>
              <span className="text-2xl font-black text-white">{tasks.length}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 animate-pulse">
          <div className="text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-lg shadow-indigo-500/20"></div>
          <span className="text-indigo-300 font-medium animate-pulse">Syncing tasks from cloud...</span>
        </div>
      )}

      {selectedProjectId && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUS_KEYS.map((key) => {
            const getColumnGradient = (status: string) => {
              switch (status) {
                case 'todo': return 'from-slate-800/40 to-slate-900/40 border-slate-700/50';
                case 'inProgress': return 'from-blue-600/10 to-blue-900/10 border-blue-500/20';
                case 'testing': return 'from-yellow-600/10 to-yellow-900/10 border-yellow-500/20';
                case 'completed': return 'from-green-600/10 to-green-900/10 border-green-500/20';
                default: return 'from-slate-800/40 to-slate-900/40 border-slate-700/50';
              }
            };

            const getColumnAccent = (status: string) => {
              switch (status) {
                case 'todo': return 'text-slate-400 bg-slate-800';
                case 'inProgress': return 'text-blue-400 bg-blue-900/40';
                case 'testing': return 'text-yellow-400 bg-yellow-900/40';
                case 'completed': return 'text-green-400 bg-green-900/40';
                default: return 'text-slate-400 bg-slate-800';
              }
            };

            return (
              <div
                key={key}
                className={`flex flex-col rounded-3xl border bg-gradient-to-br ${getColumnGradient(key)} backdrop-blur-xl p-5 shadow-2xl transition-all duration-500 min-h-[600px] ${dragOverColumn === key ? 'ring-2 ring-indigo-500/50 scale-[1.02] shadow-indigo-500/10' : ''
                  }`}
                onDragOver={(e) => handleDragOver(e, key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, key)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl shadow-inner ${getColumnAccent(key)}`}>
                      {getStatusIcon(key)}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white uppercase tracking-tighter">{STATUS_LABELS[key]}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active workflow</div>
                    </div>
                  </div>
                  <div className="bg-white/5 text-white text-xs px-2.5 py-1 rounded-full font-mono font-bold border border-white/10">
                    {columns[key].length}
                  </div>
                </div>

                {/* Tasks Container */}
                <div className="flex-1 space-y-4">
                  {columns[key].map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="group relative bg-[#1c2128] border border-white/5 rounded-2xl p-4 hover:border-indigo-500/40 hover:bg-[#22272e] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-grab active:cursor-grabbing hover:-translate-y-1"
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="p-1.5 bg-slate-900 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                            {getTaskTypeIcon(task.type)}
                          </div>
                          <div className="text-sm font-bold text-slate-200 line-clamp-2 group-hover:text-white transition-colors">
                            {task.title}
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded-xl">
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <div className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed font-medium">
                          {task.description}
                        </div>
                      )}

                      {/* Task Meta */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                          <Flag className="w-3 h-3" />
                          {task.priority || 'medium'}
                        </div>
                        {task.assignedTo && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.03] rounded-full text-[10px] text-slate-400 font-bold border border-white/[0.05]">
                            <User className="w-3 h-3" />
                            {typeof task.assignedTo === 'string'
                              ? task.assignedTo
                              : (task.assignedTo?.name || task.assignedTo?.email || 'Unassigned')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {task.dueDate && (
                          <div className={`flex items-center gap-1.5 ${isOverdue(task.dueDate) ? 'text-red-400' : ''}`}>
                            <Calendar className="w-3 h-3" />
                            {formatDueDate(task.dueDate)}
                          </div>
                        )}
                        {task.estimatedTime && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {task.estimatedTime}h
                          </div>
                        )}
                      </div>

                      {/* Hidden status dropdown for accessibility/quick change */}
                      <div className="mt-4 pt-4 border-t border-white/5">
                        {(() => {
                          const normalized = normalizeStatus(task.status_title || task.status);
                          let currentKey: (typeof STATUS_KEYS)[number] = 'todo';
                          if (normalized === 'in-progress' || normalized === 'inprogress' || normalized === 'doing' || normalized === 'progress') {
                            currentKey = 'inProgress';
                          } else if (normalized === 'testing' || normalized === 'test') {
                            currentKey = 'testing';
                          } else if (normalized === 'done' || normalized === 'completed' || normalized === 'complete' || normalized === 'finished') {
                            currentKey = 'completed';
                          }

                          return (
                            <select
                              value={currentKey}
                              onChange={(e) => handleStatusChange(task, e.target.value as (typeof STATUS_KEYS)[number])}
                              className="w-full bg-[#0d1117] text-white border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-indigo-500/50 hover:border-indigo-500/30 transition-all cursor-pointer"
                              title="Quick update"
                            >
                              {STATUS_KEYS.map(k => (
                                <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                              ))}
                            </select>
                          );
                        })()}
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {columns[key].length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-30 border-2 border-dashed border-white/5 rounded-3xl mx-2">
                      <div className="w-12 h-12 mb-4 flex items-center justify-center">
                        {getStatusIcon(key)}
                      </div>
                      <div className="text-slate-400 text-xs font-black uppercase tracking-widest">Workspace Empty</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* When no project is selected and not loading, we now render nothing (card removed). */}
      {!selectedProjectId && !loading && null}
    </div>
  );
}


