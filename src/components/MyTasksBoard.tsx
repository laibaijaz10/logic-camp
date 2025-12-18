"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getProjects } from "@/services/projectService";
import { getTasksByProject, updateTaskStatus } from "@/services/taskService";
import { useUser as useUserContext } from "@/lib/context/UserContext";

type SimpleTask = {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null;
  status_title?: string | null;
  deadline?: string | null;
  dueDate?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to_id?: number | null;
  assignedTo?: { id: number } | null;
};

const STATUS_KEYS = ['todo', 'inProgress', 'completed'] as const;
const STATUS_LABELS: Record<(typeof STATUS_KEYS)[number], string> = {
  todo: 'To Do',
  inProgress: 'In Progress',
  completed: 'Done',
};

export default function MyTasksBoard() {
  const { user } = useUserContext();
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [dueFilter, setDueFilter] = useState<'all' | 'week' | 'overdue'>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const projects = await getProjects();
        const all: SimpleTask[] = [];

        for (const proj of projects) {
          try {
            const res = await getTasksByProject(proj.id);
            const tArr = (res as any)?.tasks ?? res;
            if (Array.isArray(tArr)) {
              all.push(...(tArr as SimpleTask[]));
            }
          } catch {
            // Ignore errors per project to keep the board usable in demo
          }
        }

        const uid = (user as any)?.id;
        const mine = uid
          ? all.filter((t) => (t.assigned_to_id || t.assignedTo?.id) === uid)
          : all;
        setTasks(mine);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const passesFilters = (t: SimpleTask) => {
    // Due date filter
    const due = (t.deadline || t.dueDate) ? new Date((t.deadline || t.dueDate) as any) : null;
    if (dueFilter === 'overdue' && due) {
      if (due.getTime() >= Date.now()) return false;
    }
    if (dueFilter === 'week' && due) {
      const diff = due.getTime() - Date.now();
      if (diff < 0 || diff > 1000 * 60 * 60 * 24 * 7) return false;
    }
    return true;
  };

  const normalizeStatus = (s?: string | null) => String(s || 'todo').toLowerCase();
  const columns = useMemo(() => {
    const map: Record<(typeof STATUS_KEYS)[number], SimpleTask[]> = {
      todo: [],
      inProgress: [],
      completed: [],
    };
    for (const task of tasks) {
      if (!passesFilters(task)) continue;
      const s = normalizeStatus(task.status_title || task.status);
      if (s === 'in-progress' || s === 'inprogress' || s === 'doing' || s === 'progress') map.inProgress.push(task);
      else if (s === 'done' || s === 'completed' || s === 'complete' || s === 'finished') map.completed.push(task);
      else map.todo.push(task);
    }
    return map;
  }, [tasks, dueFilter]);

  const handleStatusChange = async (task: SimpleTask, next: (typeof STATUS_KEYS)[number]) => {
    try {
      await updateTaskStatus(task.id, next);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status_title: next } : t)));
    } catch (e) {
      alert('Failed to update task status');
    }
  };

  return (
    <section className="flex-1">
      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4 flex gap-3 items-center">
        <div className="text-sm text-gray-300">Due:</div>
        <select value={dueFilter} onChange={(e) => setDueFilter(e.target.value as any)} className="bg-slate-900 text-white border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="all">All</option>
          <option value="week">This week</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Board */}
      {loading ? (
        <div className="text-gray-400">Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['todo','inProgress','completed'] as const).map((key) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-[#0e1116]/70 backdrop-blur p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-200">{STATUS_LABELS[key]}</div>
                <div className="text-xs text-gray-400">{columns[key].length}</div>
              </div>
              <div className="space-y-2">
                {columns[key].map((task) => (
                  <div key={task.id} className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors">
                    <div className="text-sm font-medium text-white truncate">{task.title}</div>
                    {task.description && <div className="text-xs text-gray-300 line-clamp-2">{task.description}</div>}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-[10px] text-gray-400">
                        {(task.deadline || task.dueDate) && (
                          <span>Due: {new Date((task.deadline || task.dueDate) as any).toLocaleDateString()}</span>
                        )}
                      </div>
                      <select
                        defaultValue={(task.status_title || task.status || 'todo') as string}
                        onChange={(e) => handleStatusChange(task, e.target.value as (typeof STATUS_KEYS)[number])}
                        className="bg-slate-800 text-white border border-white/10 rounded px-2 py-1 text-[11px]"
                        title="Update status"
                      >
                        <option value="todo">To Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="completed">Done</option>
                      </select>
                    </div>
                  </div>
                ))}
                {columns[key].length === 0 && (
                  <div className="text-xs text-gray-500">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


