'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { getProjects } from '@/services/projectService';
import { getTasksByProject } from '@/services/taskService';
import { useUser as useUserContext } from '@/lib/context/UserContext';
import {
  FolderOpen,
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  UsersRound,
  Target,
  Calendar
} from 'lucide-react';

interface UserDashboardOverviewProps {
  loading?: boolean;
}

export default function UserDashboardOverview({ loading = false }: UserDashboardOverviewProps) {
  const { user } = useUserContext();
  const [projects, setProjects] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const p = await getProjects();
        setProjects(p);
        // Fetch tasks directly by project
        const tasks: any[] = [];
        for (const proj of p) {
          try {
            const tRes = await getTasksByProject(proj.id);
            const tArr = (tRes as any)?.tasks ?? tRes;
            tasks.push(...(Array.isArray(tArr) ? tArr : []));
          } catch (e) {
            console.error(`Failed to load tasks for project ${proj.id}:`, e);
          }
        }
        const uid = (user as any)?.id;
        const mine = uid ? tasks.filter((t) => (t.assigned_to_id || t.assignedTo?.id) === uid) : tasks;
        setMyTasks(mine);
      } finally {
        setLoadingData(false);
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
    const overdue = myTasks.filter((t) => {
      if (!t.deadline && !t.dueDate) return false;
      const d = new Date((t.deadline || t.dueDate) as any);
      const now = new Date();
      return d < now && !completed;
    }).length;

    return { totalProjects, pending, inProgress, completed, upcomingDeadlines, overdue };
  }, [projects, myTasks]);

  const statsCards = [
    {
      title: 'My Projects',
      value: stats.totalProjects,
      subtitle: 'Active projects',
      icon: FolderOpen,
      gradient: 'from-blue-600 to-blue-500',
      bgGradient: 'from-blue-600/20 to-blue-500/20',
      borderColor: 'border-blue-500/30',
      loading: loadingData
    },
    {
      title: 'Active Tasks',
      value: stats.pending + stats.inProgress,
      subtitle: `${stats.pending} pending, ${stats.inProgress} in progress`,
      icon: CheckSquare,
      gradient: 'from-green-600 to-green-500',
      bgGradient: 'from-green-600/20 to-green-500/20',
      borderColor: 'border-green-500/30',
      loading: loadingData
    },
    {
      title: 'Completed',
      value: stats.completed,
      subtitle: 'Tasks finished',
      icon: Target,
      gradient: 'from-purple-600 to-purple-500',
      bgGradient: 'from-purple-600/20 to-purple-500/20',
      borderColor: 'border-purple-500/30',
      loading: loadingData
    }
  ];

  const quickMetrics = [
    {
      label: 'Completion Rate',
      value: (stats.pending + stats.inProgress + stats.completed) > 0
        ? `${Math.round((stats.completed / (stats.pending + stats.inProgress + stats.completed)) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      label: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      icon: Calendar,
      color: stats.upcomingDeadlines > 0 ? 'text-yellow-400' : 'text-green-400'
    },
    {
      label: 'Overdue Tasks',
      value: stats.overdue,
      icon: AlertCircle,
      color: stats.overdue > 0 ? 'text-red-400' : 'text-green-400'
    },
    {
      label: 'Productivity',
      value: stats.completed > 0 ? 'High' : 'Getting Started',
      icon: Clock,
      color: stats.completed > 0 ? 'text-blue-400' : 'text-slate-400'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your personal overview.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Last updated</div>
          <div className="text-white font-medium">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bgGradient} border ${card.borderColor} backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300 group`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    {card.loading ? (
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    ) : (
                      <div className="text-xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                        {card.value}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
                  <p className="text-sm text-slate-300">{card.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-xl hover:bg-slate-700/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <div>
                  <div className="text-sm text-slate-400">{metric.label}</div>
                  <div className="text-sm font-semibold text-white">{metric.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
