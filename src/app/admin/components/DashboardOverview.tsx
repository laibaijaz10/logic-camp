"use client";
import React, { useState } from 'react';
import { Users, UsersRound, FolderOpen, CheckSquare, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { User, Team, Project, Task } from '../hooks/useAdminData';
import StatusPills from '@/components/StatusPills';
import { updateProjectStatus } from '@/services/projectService';

interface DashboardOverviewProps {
  users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  loadingUsers: boolean;
  loadingTeams: boolean;
  loadingProjects: boolean;
  loadingTasks: boolean;
  totalTeams: number;
  totalProjects: number;
}

export default function DashboardOverview({
  users,
  teams,
  projects,
  tasks,
  loadingUsers,
  loadingTeams,
  loadingProjects,
  loadingTasks,
  totalTeams,
  totalProjects,
}: DashboardOverviewProps) {
  // Calculate stats
  const totalUsers = users.length;
  const approvedUsers = users.filter(user => user.isApproved).length;
  const pendingUsers = users.filter(user => !user.isApproved).length;
  
  const [statusOverrides, setStatusOverrides] = useState<Record<number, string>>({});

  const totalTeamsProp = totalTeams || teams.length;
  // If members are not loaded on teams yet, fall back to treating all teams as having members
  const teamsWithMembers = teams.some(team => Array.isArray((team as any).members) && (team as any).members.length > 0)
    ? teams.filter(team => Array.isArray((team as any).members) && (team as any).members.length > 0).length
    : totalTeamsProp;
  
  const totalProjectsProp = totalProjects || projects.length;
  // Map mock status_title values (e.g. "In Progress", "To Do", "Testing", "Done") into active/completed
  const activeProjects = projects.filter(project => {
    const status = String((project as any).status_title || '').toLowerCase();
    return status === 'in progress' || status === 'to do' || status === 'testing' || status === 'doing';
  }).length;
  const completedProjects = projects.filter(project => {
    const status = String((project as any).status_title || '').toLowerCase();
    return status === 'done' || status === 'completed';
  }).length;
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  const statsCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      subtitle: `${approvedUsers} approved, ${pendingUsers} pending`,
      icon: Users,
      gradient: 'from-blue-600 to-blue-500',
      bgGradient: 'from-blue-600/20 to-blue-500/20',
      borderColor: 'border-blue-500/30',
      loading: loadingUsers
    },
    {
      title: 'Teams',
      value: totalTeamsProp,
      subtitle: `${teamsWithMembers} with members`,
      icon: UsersRound,
      gradient: 'from-green-600 to-green-500',
      bgGradient: 'from-green-600/20 to-green-500/20',
      borderColor: 'border-green-500/30',
      loading: loadingTeams
    },
    {
      title: 'Projects',
      value: totalProjectsProp,
      subtitle: `${activeProjects} active, ${completedProjects} completed`,
      icon: FolderOpen,
      gradient: 'from-purple-600 to-purple-500',
      bgGradient: 'from-purple-600/20 to-purple-500/20',
      borderColor: 'border-purple-500/30',
      loading: loadingProjects
    }
  ];

  // Sort projects by last updated/created date and take the latest ones
  const latestProjects = [...projects]
    .map((project) => {
      const anyProject: any = project as any;
      const updatedAt = anyProject.updatedAt ? new Date(anyProject.updatedAt) : undefined;
      const createdAt = anyProject.createdAt ? new Date(anyProject.createdAt) : undefined;
      const lastUpdated = updatedAt || createdAt || new Date();

      const teamMembers = (anyProject.team && Array.isArray(anyProject.team.members))
        ? anyProject.team.members
        : [];

      return {
        ...anyProject,
        _lastUpdated: lastUpdated,
        _teamSize: teamMembers.length,
      };
    })
    .sort((a, b) => (b._lastUpdated as Date).getTime() - (a._lastUpdated as Date).getTime())
    .slice(0, 5);

  const quickMetrics = [
    {
      label: 'Completion Rate',
      value: totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      label: 'Overdue Tasks',
      value: overdueTasks,
      icon: AlertCircle,
      color: overdueTasks > 0 ? 'text-red-400' : 'text-green-400'
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: Clock,
      color: 'text-blue-400'
    },
    {
      label: 'Team Utilization',
      value: totalTeams > 0 ? `${Math.round((teamsWithMembers / totalTeams) * 100)}%` : '0%',
      icon: CheckCircle,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-slate-400">Welcome back! Here's what's happening with your team.</p>
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

      {/* Latest Projects Table */}
      <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/80 border border-slate-700/70 rounded-2xl p-6 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.55)] mt-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white tracking-wide">Latest Projects</h2>
          <p className="text-xs md:text-sm text-slate-400">Showing most recently updated projects</p>
        </div>

        {loadingProjects ? (
          <div className="flex items-center justify-center py-10 text-slate-300 text-base">
            Loading projects...
          </div>
        ) : latestProjects.length === 0 ? (
          <div className="py-6 text-base text-slate-300">No projects found yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900/40">
            <table className="min-w-full text-sm md:text-[0.95rem]">
              <thead>
                <tr className="text-left text-slate-300 bg-slate-900/70 border-b border-slate-700/80">
                  <th className="py-3 pl-4 pr-4 font-semibold tracking-wide text-xs md:text-sm">Project ID</th>
                  <th className="py-3 pr-4 font-semibold tracking-wide text-xs md:text-sm">Project Name</th>
                  <th className="py-3 pr-4 font-semibold tracking-wide text-xs md:text-sm">Description</th>
                  <th className="py-3 pr-4 font-semibold tracking-wide text-xs md:text-sm">Status</th>
                  <th className="py-3 pr-4 font-semibold tracking-wide text-xs md:text-sm">Team Size</th>
                  <th className="py-3 pr-4 font-semibold tracking-wide text-xs md:text-sm">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {latestProjects.map((project) => {
                  const displayStatus = statusOverrides[project.id] ?? (project as any).status_title ?? 'To Do';
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/70 transition-colors"
                    >
                      <td className="py-3 pl-4 pr-4 text-slate-300 align-middle">{project.id}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-50 align-middle">{project.name}</td>
                      <td className="py-3 pr-4 text-slate-300 max-w-xs truncate align-middle">
                        {project.description}
                      </td>
                      <td className="py-2 pr-4 align-middle">
                        <StatusPills
                          currentStatus={displayStatus}
                          ariaLabel={`Project ${project.name} status`}
                          onStatusChange={async (nextStatus) => {
                            setStatusOverrides((prev) => ({ ...prev, [project.id]: nextStatus }));
                            try {
                              await updateProjectStatus(project.id, nextStatus);
                            } catch (e) {
                              console.error('Failed to update project status', e);
                              setStatusOverrides((prev) => {
                                const updated = { ...prev };
                                delete updated[project.id];
                                return updated;
                              });
                            }
                          }}
                        />
                      </td>
                      <td className="py-3 pr-4 text-slate-200 font-medium align-middle">{(project as any)._teamSize ?? (project.team?.members?.length ?? 0)}</td>
                      <td className="py-3 pr-4 text-slate-300 align-middle whitespace-nowrap">
                        {project.updatedAt
                          ? new Date(project.updatedAt).toLocaleDateString()
                          : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}