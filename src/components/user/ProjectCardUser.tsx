"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Users, Clock, AlertCircle, CheckCircle, Zap, Calendar } from "lucide-react";
import { getTasksByProject } from "@/services/taskService";

export type UserProject = {
  id: number;
  name: string;
  description?: string | null;
  end_date?: string | null;
  endDate?: string | null;
  updatedAt?: string | Date;
  createdAt?: string | Date;
  team?: { members?: any[] };
  status_title?: string;
};

const STATUS_CONFIG = {
  completed: { bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20', icon: CheckCircle },
  'in-progress': { bg: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20', icon: Zap },
  review: { bg: 'from-purple-500/10 via-violet-500/5 to-fuchsia-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20', icon: AlertCircle },
  default: { bg: 'from-gray-500/10 via-slate-500/5 to-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', glow: 'shadow-gray-500/20', icon: Clock },
} as const;

const normalizeStatus = (rawStatus?: string): keyof typeof STATUS_CONFIG => {
  if (!rawStatus) return 'default';
  const raw = rawStatus.trim().toLowerCase();
  if (["done","completed","complete","finished"].includes(raw)) return 'completed';
  if (["doing","in-progress","in progress","progress","inprogress"].includes(raw)) return 'in-progress';
  if (["review","in-review","in review"].includes(raw)) return 'review';
  return (raw as keyof typeof STATUS_CONFIG) in STATUS_CONFIG ? (raw as keyof typeof STATUS_CONFIG) : 'default';
};

const getRemainingDays = (endDate?: string | null): number | null => {
  const dateStr = endDate || undefined;
  if (!dateStr) return null;
  const deadline = new Date(dateStr);
  if (Number.isNaN(deadline.getTime())) return null;
  const diff = deadline.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDeadlineText = (remainingDays: number | null): string => {
  if (remainingDays === null) return "No deadline";
  if (remainingDays > 0) return `${remainingDays}d left`;
  if (remainingDays === 0) return "Due today";
  return `${Math.abs(remainingDays)}d overdue`;
};

export default function ProjectCardUser({ project, index }: { project: UserProject; index: number }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [taskCount, setTaskCount] = useState<number | null>(null);

  const statusKey = normalizeStatus(project.status_title);
  const statusCfg = STATUS_CONFIG[statusKey];
  const RemainingDays = getRemainingDays(project.end_date || project.endDate || null);
  const StatusIcon = statusCfg.icon;

  useEffect(() => {
    let mounted = true;
    const loadTasks = async () => {
      try {
        const res = await getTasksByProject(project.id);
        const arr = (res as any)?.tasks ?? res;
        if (!mounted) return;
        setTaskCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        if (mounted) setTaskCount(0);
      }
    };
    loadTasks();
    return () => {
      mounted = false;
    };
  }, [project.id]);

  const handleClick = () => router.push(`/projects/${project.id}`);

  return (
    <div
      className="group transform transition-all duration-300 hover:scale-[1.02] w-full mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={handleClick}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
        className={`relative text-left w-full rounded-2xl border backdrop-blur-xl p-3 sm:p-4 cursor-pointer overflow-hidden transition-all duration-500 ease-out
          ${isHovered ? `border-white/30 bg-gradient-to-br from-slate-800/90 via-slate-900/70 to-black/50 shadow-2xl ${statusCfg.glow}` : 'border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-800/30 to-slate-900/40 shadow-xl'}`}
      >
        {/* Background gradient hover effect */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-0'}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${statusCfg.bg}`}></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-conic from-indigo-500/20 via-purple-500/10 to-cyan-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2 z-20">
          <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl backdrop-blur-lg bg-gradient-to-r ${statusCfg.bg} border ${statusCfg.border} shadow-lg transition-all duration-300`}>
            <span className={statusCfg.text}><StatusIcon className="h-4 w-4" /></span>
            <span className={`capitalize font-semibold text-xs ${statusCfg.text}`}>{project.status_title ?? 'todo'}</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className={`shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 grid place-items-center shadow-xl transition-all duration-500 ${isHovered ? 'shadow-indigo-500/40 rotate-12 scale-110' : 'shadow-indigo-500/20'}`}>
              <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h3 className={`font-bold text-sm sm:text-lg leading-tight truncate ${isHovered ? 'bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent' : 'text-white'}`}>{project.name}</h3>
              {project.description && (
                <p className={`mt-1 sm:mt-2 text-xs sm:text-sm line-clamp-2 ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>{project.description}</p>
              )}
            </div>
          </div>

          <div className="mb-3 sm:mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className={`h-full flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all duration-300 ${isHovered ? 'bg-purple-500/20 border-purple-400/40 shadow-lg shadow-purple-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
              <div className="p-0.5 sm:p-1 bg-purple-500/20 rounded-md sm:rounded-lg">
                <Users className={`h-3 w-3 sm:h-4 sm:w-4 ${isHovered ? 'text-purple-300' : 'text-purple-400'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">Team</p>
                <p className={`font-bold text-xs sm:text-sm ${isHovered ? 'text-purple-300' : 'text-purple-400'}`}>{Array.isArray(project.team?.members) ? project.team?.members?.length : 0}</p>
              </div>
            </div>

            {(project.end_date || project.endDate) ? (
              <div className={`h-full flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all duration-300 ${RemainingDays !== null && RemainingDays < 0 ? 'bg-red-500/10 border-red-500/20' : isHovered ? 'bg-amber-500/20 border-amber-400/40 shadow-lg shadow-amber-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <div className="p-0.5 sm:p-1 bg-amber-500/20 rounded-md sm:rounded-lg">
                  <Clock className={`h-3 w-3 sm:h-4 sm:w-4 ${isHovered ? 'text-amber-300' : 'text-amber-400'}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">Deadline</p>
                  <p className={`font-semibold text-xs ${isHovered ? 'text-amber-300' : 'text-amber-400'}`}>{formatDeadlineText(RemainingDays)} <span className="text-xs text-gray-400 hidden sm:inline">{new Date((project.end_date || project.endDate) as string).toLocaleDateString()}</span></p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-700/40 bg-slate-800/40">
                <div className="p-0.5 sm:p-1 bg-slate-700/50 rounded-md sm:rounded-lg">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">Deadline</p>
                  <p className="font-semibold text-xs text-slate-400">No deadline</p>
                </div>
              </div>
            )}

            <div className={`h-full flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all duration-300 ${isHovered ? 'bg-cyan-500/20 border-cyan-400/40 shadow-lg shadow-cyan-500/20' : 'bg-cyan-500/10 border-cyan-500/20'}`}>
              <div className="p-0.5 sm:p-1 bg-cyan-500/20 rounded-md sm:rounded-lg">
                <FolderKanban className={`h-3 w-3 sm:h-4 sm:w-4 ${isHovered ? 'text-cyan-300' : 'text-cyan-400'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">Total Tasks</p>
                <p className={`font-bold text-xs sm:text-sm ${isHovered ? 'text-cyan-300' : 'text-cyan-400'}`}>
                  {taskCount !== null ? taskCount : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all duration-300 flex-1 bg-cyan-500/10 border-cyan-500/20">
            <div className="p-0.5 sm:p-1 bg-cyan-500/20 rounded-md sm:rounded-lg">
              <Calendar className={`h-3 w-3 sm:h-4 sm:w-4 ${isHovered ? 'text-cyan-300' : 'text-cyan-400'}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">Created</p>
              <p className={`font-semibold text-xs ${isHovered ? 'text-cyan-300' : 'text-cyan-400'}`}>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>

        {/* Border glow */}
        <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 rounded-3xl border border-white/20"></div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10"></div>
        </div>
      </div>
    </div>
  );
}
