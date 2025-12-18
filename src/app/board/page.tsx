"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getProjects } from "@/services/projectService";
import { getTasksByProject, updateTaskStatus } from "@/services/taskService";
import { useUser } from "@/lib/context/UserContext";

type SimpleProject = { id: number; name: string };

type SimpleTask = {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null;
  status_title?: string | null;
  dueDate?: string | null;
  assigned_to_id?: number | null;
};

const STATUS_KEYS = ["todo", "inProgress", "testing", "completed"] as const;
const STATUS_LABELS: Record<(typeof STATUS_KEYS)[number], string> = {
  todo: "To Do",
  inProgress: "Doing",
  testing: "Testing",
  completed: "Done",
};

export default function BoardPage() {
  const [projects, setProjects] = useState<SimpleProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Load all projects on mount
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

  // Load tasks when project selected
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

        // Enforce per-user visibility: employees see only their own tasks.
        if (user) {
          const isAdminOrLead = user.role === "admin" || user.role === "teamLead";
          if (!isAdminOrLead) {
            arr = arr.filter((task) => !task.assigned_to_id || task.assigned_to_id === user.id);
          }
        }

        // If no real tasks are returned for this project, generate 5-6 dummy tasks on the frontend only
        if (!arr.length) {
          const project = projects.find((p) => p.id === Number(selectedProjectId));
          const projectName = project?.name || `Project ${selectedProjectId}`;
          const dummyCount = 6;

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

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Project Board</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track your project tasks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-[#0e1116]/80 backdrop-blur p-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : "")}
              className="bg-slate-900/50 text-white border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-w-[200px]"
            >
              <option value="">Choose a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {selectedProjectId && (
            <div className="h-6 w-px bg-white/10 mx-2" />
          )}
          {selectedProjectId && (
            <div className="text-sm text-gray-400">
              Showing <span className="text-white font-medium">{tasks.length}</span> tasks
            </div>
          )}
        </div>
      </div>

      {/* Board */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-6 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-gray-400 animate-pulse py-10 justify-center">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Syncing board data...</span>
        </div>
      )}

      {selectedProjectId && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STATUS_KEYS.map((key) => (
            <div key={key} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${key === 'todo' ? 'bg-gray-400' :
                      key === 'inProgress' ? 'bg-blue-400' :
                        key === 'testing' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                  <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">{STATUS_LABELS[key]}</span>
                </div>
                <span className="bg-white/5 text-[10px] text-gray-400 px-2 py-0.5 rounded-full font-mono border border-white/5">
                  {columns[key].length}
                </span>
              </div>

              <div className="flex flex-col gap-3 min-h-[500px] rounded-2xl bg-white/[0.02] border border-white/[0.05] p-3">
                {columns[key].map((task) => (
                  <div
                    key={task.id}
                    className="group rounded-xl border border-white/10 bg-[#161b22] p-4 hover:border-blue-500/50 hover:bg-[#1c2128] transition-all cursor-pointer shadow-lg hover:shadow-blue-500/5"
                  >
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">{task.title}</div>
                    {task.description && <div className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{task.description}</div>}

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] text-gray-500 uppercase font-medium">Due Date</div>
                        <div className="text-[10px] text-gray-300">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                        </div>
                      </div>

                      <select
                        defaultValue={(task.status_title || task.status || 'todo') as string}
                        onChange={(e) => handleStatusChange(task, e.target.value as (typeof STATUS_KEYS)[number])}
                        className="bg-[#0d1117] text-white border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none hover:border-white/20 transition-all font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="todo">To Do</option>
                        <option value="inProgress">Doing</option>
                        <option value="testing">Testing</option>
                        <option value="completed">Done</option>
                      </select>
                    </div>
                  </div>
                ))}

                {columns[key].length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 opacity-20">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-white mb-2" />
                    <span className="text-[10px] font-medium uppercase tracking-tighter">Empty</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!selectedProjectId && !loading && (
        <div className="flex flex-col items-center justify-center py-32 rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.01]">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h2a2 2 0 000-4M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Ready to Get Organized?</h2>
          <p className="text-gray-400 text-center max-w-sm">Select a project from the dropdown above to view and manage your tasks on the board.</p>
        </div>
      )}
    </div>
  );
}
