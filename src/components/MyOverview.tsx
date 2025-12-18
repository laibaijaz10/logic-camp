"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getProjects } from "@/services/projectService";
import { getTasksByProject } from "@/services/taskService";
import { useUser as useUserContext } from "@/lib/context/UserContext";

type StatCardProps = { title: string; value: string | number; hint?: string };

function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-gray-400">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-[11px] text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

export default function MyOverview() {
  const { user } = useUserContext();
  const [projects, setProjects] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await getProjects();
        setProjects(p);

        const collected: any[] = [];
        for (const proj of p) {
          try {
            const res = await getTasksByProject(proj.id);
            const tArr = (res as any)?.tasks ?? res;
            if (Array.isArray(tArr)) {
              collected.push(...tArr);
            }
          } catch {
            // Ignore per-project errors to keep overview usable in demo
          }
        }

        const uid = (user as any)?.id;
        const mine = uid
          ? collected.filter((t) => (t.assigned_to_id || t.assignedTo?.id) === uid)
          : collected;
        setMyTasks(mine);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const stats = useMemo(() => {
    const totalProjects = projects?.length || 0;
    const pending = myTasks.filter((t) => (t.status_title || t.status || 'todo').toLowerCase().includes('todo')).length;
    const inProgress = myTasks.filter((t) => {
      const s = String(t.status_title || t.status || '').toLowerCase();
      return s.includes('progress') || s === 'inprogress' || s === 'doing';
    }).length;
    const completed = myTasks.filter((t) => {
      const s = String(t.status_title || t.status || '').toLowerCase();
      return s === 'completed' || s === 'done' || s === 'complete' || s === 'finished';
    }).length;
    const upcomingDeadlines = myTasks.filter((t) => t.deadline || t.dueDate)
      .filter((t) => {
        const d = new Date((t.deadline || t.dueDate) as any);
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 7; // within 7 days
      }).length;
    return { totalProjects, pending, inProgress, completed, upcomingDeadlines };
  }, [projects, myTasks]);

  return (
    <section className="flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Projects" value={stats.totalProjects} />
        <StatCard title="Tasks Pending" value={stats.pending} />
        <StatCard title="In Progress" value={stats.inProgress} />
        <StatCard title="Completed" value={stats.completed} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Deadlines coming up</div>
            <div className="text-xs text-gray-400 mt-1">Next 7 days</div>
          </div>
          <div className="text-2xl font-semibold">{stats.upcomingDeadlines}</div>
        </div>
      </div>
      {loading && <div className="text-gray-400 mt-4">Loading your overview...</div>}
    </section>
  );
}


