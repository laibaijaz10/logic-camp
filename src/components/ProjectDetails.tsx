'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/lib/context/UserContext';
import { db } from '@/lib/mockData';
import { formatDate } from '@/utils/helpers';
import StatusDropdown from '@/components/StatusDropdown';
import { Project, StatusItem, TeamMember, Task } from '@/types';
import {
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Save,
  X,
  Users,
  Calendar,
  Clock,
  Layout,
  Monitor,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProjectDetailsProps {
  project: Project;
}

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  const { user } = useUser();
  const [editing, setEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>((project as any).status_title || 'To Do');
  const [form, setForm] = useState({
    name: project.name,
    description: project.description || '',
    start_date: project.start_date ? new Date(project.start_date).toISOString().slice(0, 10) : '',
    end_date: project.end_date ? new Date(project.end_date).toISOString().slice(0, 10) : '',
    team_id: (project as any).team_id || (project as any).team?.id,
  });

  const [projectStatuses, setProjectStatuses] = useState<StatusItem[]>(
    Array.isArray((project as any).statuses) ? (project as any).statuses : []
  );

  const [teams, setTeams] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksCount, setTasksCount] = useState(0);

  // Sync state ONLY when project ID changes (e.g. navigation)
  useEffect(() => {
    setSelectedStatus((project as any).status_title || 'To Do');
    setProjectStatuses(Array.isArray((project as any).statuses) ? (project as any).statuses : []);
    setForm({
      name: project.name,
      description: project.description || '',
      start_date: project.start_date ? new Date(project.start_date).toISOString().slice(0, 10) : '',
      end_date: project.end_date ? new Date(project.end_date).toISOString().slice(0, 10) : '',
      team_id: (project as any).team_id || (project as any).team?.id,
    });
    setEditing(false); // Reset editing mode on navigation
  }, [project.id]); // ONLY track ID changes

  useEffect(() => {
    setTeams(db.getTeams());
    const loadedTasks = db.getTasksByProject(project.id) as Task[];
    setTasks(loadedTasks);
    setTasksCount(loadedTasks.length);
  }, [project.id]);

  const handleSave = async () => {
    try {
      db.updateProject(project.id, {
        name: form.name,
        description: form.description,
        start_date: form.start_date ? new Date(form.start_date) : undefined,
        end_date: form.end_date ? new Date(form.end_date) : undefined,
        team_id: form.team_id,
        status_title: selectedStatus,
        statuses: projectStatuses,
      } as any);
      setEditing(false);
      toast.success("Project updated successfully");
    } catch (e) {
      toast.error("Failed to update project");
    }
  };

  const statusTitle = selectedStatus || (project as any).status_title || 'To Do';
  const members = (project as any).members || (project as any).team?.members || [];

  const visibleTasks = useMemo(() => {
    if (!user) return tasks;
    const isAdminOrLead = user.role === 'admin' || user.role === 'teamLead';
    if (isAdminOrLead) return tasks;
    return tasks.filter(t => t.assigned_to_id === user.id);
  }, [tasks, user]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
        {/* Breadcrumbs */}
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-2 font-bold uppercase tracking-widest">
          <span className="hover:text-slate-300 cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-slate-300 cursor-pointer transition-colors">Projects</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-indigo-400">{project.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">{project.name}</h1>
            <p className="text-slate-400 max-w-2xl font-medium leading-relaxed">
              {project.description || 'The main company landing page and blog.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-bold shadow-lg shadow-emerald-500/5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {statusTitle}
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm font-bold text-white transition-all shadow-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Start Date', value: form.start_date || 'Not set', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'End Date', value: form.end_date || 'Not set', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { label: 'Team Members', value: members.length, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
            { label: 'Tasks', value: tasksCount, icon: Layout, color: 'text-pink-400', bg: 'bg-pink-400/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-950/30 border border-white/5 rounded-2xl p-5 hover:bg-slate-950/50 transition-colors group">
              <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-2 flex items-center justify-between">
                {stat.label}
                <stat.icon className={`w-3.5 h-3.5 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Box Section */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
        {/* Box Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white">{project.name}</h2>
          </div>

          {user?.role === 'admin' ? (
            <div className="flex items-center gap-3">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
                >
                  Edit Project
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm font-bold text-white transition-all shadow-xl"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Box Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Status & Team Row */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Project Status</label>
                <div className="relative">
                  <StatusDropdown
                    statuses={projectStatuses}
                    onStatusesChange={setProjectStatuses}
                    selectedStatus={selectedStatus}
                    onStatusSelect={setSelectedStatus}
                    entityType="project"
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Assign Team</label>
                <select
                  disabled={!editing}
                  value={form.team_id}
                  onChange={(e) => setForm({ ...form, team_id: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white font-medium focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates Row */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Start Date</label>
                  <input
                    type="date"
                    readOnly={!editing}
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white font-medium focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none read-only:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">End Date</label>
                  <input
                    type="date"
                    readOnly={!editing}
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white font-medium focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none read-only:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Quick Indicator</label>
                <div className="flex items-center gap-3 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                  <Monitor className="w-5 h-5 text-indigo-400" />
                  <div className="text-sm font-bold text-slate-300">Active Monitoring Enabled</div>
                  <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-black uppercase">
                    Live
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Project Description</label>
            <textarea
              readOnly={!editing}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide a detailed overview of the project scope and objectives..."
              className="w-full bg-slate-950 border border-white/10 rounded-3xl px-6 py-5 text-white font-medium min-h-[160px] focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none resize-none read-only:opacity-70 leading-relaxed"
            />
          </div>

          {/* Tasks Section */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white tracking-tight uppercase">Project Tasks</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {tasksCount} total task{tasksCount === 1 ? '' : 's'} in this project
                </p>
              </div>
              <div className="text-xs text-slate-400">
                Showing
                {" "}
                <span className="font-semibold text-white">{visibleTasks.length}</span>
                {" "}
                task{visibleTasks.length === 1 ? '' : 's'} for you
              </div>
            </div>

            {visibleTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
                No tasks assigned yet. Use the admin panel or demo flows to create tasks for this project.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleTasks.map((task) => {
                  const status = String(task.status_title || 'todo').toLowerCase();
                  const isDone = ['done', 'completed', 'complete', 'finished'].includes(status);
                  const isInProgress = ['in-progress', 'inprogress', 'doing', 'progress'].includes(status);
                  const isTesting = status === 'testing';

                  const statusColor = isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isInProgress
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : isTesting
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-500/10 border-slate-500/30 text-slate-300';

                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl bg-slate-950/40 border border-white/5 p-4 flex flex-col gap-3 hover:bg-slate-950/60 hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{task.title}</h4>
                          {task.description && (
                            <p className="mt-1 text-xs text-slate-400 line-clamp-2">{task.description}</p>
                          )}
                        </div>
                        <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
                          {task.status_title || 'todo'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-widest text-[10px] text-slate-500">Assignee</span>
                          <span className="font-semibold text-slate-200">
                            {task.assignedTo?.name || `User #${task.assigned_to_id ?? '-'}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-widest text-[10px] text-slate-500">Time</span>
                          <span className="font-semibold text-slate-200">
                            {task.spent_time ?? 0}m / {task.expected_time ?? 0}m
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}