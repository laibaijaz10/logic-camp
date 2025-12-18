'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectStatus } from '@/services/projectService';
import { formatDate } from '@/utils/helpers';
import { db } from '@/lib/mockData';
import toast from 'react-hot-toast';
import { Project, StatusItem } from '@/types';
import { Plus, Save, Edit3, X, Users, Calendar, FolderKanban, CheckCircle, Clock, Shield } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import { getTasksByProject, createTask, updateTaskStatus, deleteTask } from '@/services/taskService';
import { useUser } from '@/lib/context/UserContext';
import StatusDropdown from '@/components/StatusDropdown';

interface AdminProjectDetailsProps {
  project: Project;
  initialTasks?: any[];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'planning': return 'text-blue-400 bg-blue-400/10';
    case 'active': return 'text-green-400 bg-green-400/10';
    case 'on-hold': return 'text-yellow-400 bg-yellow-400/10';
    case 'completed': return 'text-emerald-400 bg-emerald-400/10';
    case 'cancelled': return 'text-red-400 bg-red-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
}

type EditableProject = Partial<{
  name: string;
  description: string;
  endDate: string;
  status: string;
  teamId: number;
}>;

type TeamOption = { id: number; name: string };

type TaskForm = { title: string; description: string; deadline?: string; status?: string };

type StatusForm = { name: string; description: string; color: string; entity_type: 'project' | 'task' };

export default function AdminProjectDetails({ project, initialTasks = [] }: AdminProjectDetailsProps) {
  const router = useRouter();
  const { user } = useUser();
  const canEdit = useMemo(() => {
    // For admin pages, assume user can edit if they can access the page
    // This is a fallback in case user context isn't working properly
    if (!user) return true;

    const role = (user?.role || '').toString().toLowerCase();
    const isPrivileged = role === 'admin' || role === 'teamlead' || role === 'team_lead' || role === 'team lead'; // cSpell:ignore teamlead
    const isOwner = !!(user as any)?.id && ((project as any)?.createdById === (user as any).id || (project as any)?.ownerId === (user as any).id);
    return isPrivileged || isOwner;
  }, [user, project]);

  const [projectStatus, setProjectStatus] = useState<string>((project as any).status_title || 'todo');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditableProject>({
    name: project.name,
    description: project.description || '',
    endDate: project.end_date ? new Date(project.end_date).toISOString().slice(0, 10) : '',
    status: (project as any).status_title || 'todo',
    teamId: (project as any).team_id || (project as any).team?.id,
  });
  const [saving, setSaving] = useState(false);
  // Custom statuses (project-level)
  const [customStatuses, setCustomStatuses] = useState<StatusItem[]>(
    Array.isArray((project as any).statuses) ? ((project as any).statuses as StatusItem[]) : []
  );

  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>(Array.isArray((project as any).members) ? (project as any).members : []);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [taskForm, setTaskForm] = useState<TaskForm>({ title: '', description: '', deadline: '', status: 'todo' });
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Status management state
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  useEffect(() => {
    // Mock Teams load
    const mockTeams = db.getTeams().map(t => ({ id: t.id, name: t.name }));
    setTeams(mockTeams);
  }, []);

  // Load statuses for different entity types
  useEffect(() => {
    const loadStatuses = async () => {
      setLoadingStatuses(true);
      try {
        // Use db to get statuses or mock them
        const mockProjectStatuses = [{ id: 1, title: 'Planning', entity_type: 'project' }, { id: 2, title: 'Active', entity_type: 'project' }];
        const mockTaskStatuses = [{ id: 3, title: 'Todo', entity_type: 'task' }, { id: 4, title: 'Done', entity_type: 'task' }];

        setStatuses([...mockProjectStatuses, ...mockTaskStatuses]);

        if (!Array.isArray((project as any).statuses) || (project as any).statuses.length === 0) {
          setCustomStatuses(mockProjectStatuses as any);
        }
      } catch (error) {
        console.error('Failed to load statuses:', error);
      } finally {
        setLoadingStatuses(false);
      }
    };

    loadStatuses();
  }, [project]);

  // Enable edit mode by default for users who can edit
  useEffect(() => {
    if (canEdit) setEditing(true);
  }, [canEdit]);


  // Fetch team members
  useEffect(() => {
    const currentTeamId = form.teamId || (project as any).teamId || (project as any).team?.id;
    if (!currentTeamId) {
      setTeamMembers([]);
      return;
    }
    const team = db.getTeams().find(t => t.id === currentTeamId);
    setTeamMembers(team ? team.members || [] : []);
  }, [form.teamId, project]);

  const handleProjectStatusChange = async (newStatus: string) => {
    try {
      db.updateProject(project.id, { status_title: newStatus });
      setProjectStatus(newStatus);
      setForm((f) => ({ ...f, status: newStatus }));
    } catch (error) {
      console.error('Failed to update project status', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      db.updateProject(project.id, {
        name: form.name,
        description: form.description,
        end_date: form.endDate ? new Date(form.endDate) : undefined,
        status_title: form.status,
        team_id: form.teamId,
      });
      setEditing(false);
      toast.success("Project updated successfully");
    } catch (e) {
      console.error('Failed to update project', e);
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const createTaskInline = async () => {
    if (!taskForm.title.trim()) return;
    try {
      const payload = {
        title: taskForm.title.trim(),
        description: taskForm.description?.trim() || undefined,
        deadline: taskForm.deadline || undefined,
        statusTitle: taskForm.status || 'todo',
        projectId: project.id,
        statuses: customStatuses && customStatuses.length > 0 ? customStatuses : undefined,
      } as any;
      const res = await createTask(payload);
      const created = (res as any)?.task || res;
      setTaskForm({ title: '', description: '', deadline: '', status: 'todo' });
      // Optimistically append without refetch
      setTasks((t) => [{ ...created }, ...t]);
    } catch (e) {
      console.error('Failed to create task', e);
    }
  };

  const toggleTaskStatus = async (task: any) => {
    const newStatus = task.completed ? 'todo' : 'completed';
    try {
      // Find the status title from the statuses
      const statusObj = statuses.find(s => s.title === newStatus && s.entity_type === 'task');
      if (statusObj) {
        await updateTaskStatus(task.id, statusObj.title);
        const list = await getTasksByProject(project.id);
        const arr = Array.isArray(list) ? list : (list as any)?.tasks || [];
        setTasks(arr);
      }
    } catch (e) {
      console.error('Failed to update task status', e);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      console.error('Failed to delete task', e);
    }
  };

  const getStatusesByEntity = (entityType: 'project' | 'task') => {
    return statuses.filter(s => s.entity_type === entityType);
  };

  const getRemainingDays = () => {
    if (!project.end_date) return null;
    const today = new Date();
    const deadline = new Date(project.end_date);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // --- Styling helpers to match ProjectCard ---
  const STATUS_CONFIG = {
    completed: {
      bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/20'
    },
    'in-progress': {
      bg: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/20'
    },
    review: {
      bg: 'from-purple-500/10 via-violet-500/5 to-fuchsia-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/20'
    },
    default: {
      bg: 'from-gray-500/10 via-slate-500/5 to-gray-500/10',
      border: 'border-gray-500/30',
      text: 'text-gray-400',
      glow: 'shadow-gray-500/20'
    }
  } as const;

  const normalizeStatus = (status?: string | { title: string; color?: string }): { key: keyof typeof STATUS_CONFIG; label: string } => {
    if (!status) return { key: 'default', label: 'todo' };

    // Handle both string and object status formats
    const statusName = typeof status === 'string' ? status : status.title;
    if (!statusName) return { key: 'default', label: 'todo' };

    const raw = statusName.trim().toLowerCase();
    if (['done', 'completed', 'complete', 'finished'].includes(raw)) return { key: 'completed', label: 'done' };
    if (['doing', 'in-progress', 'in progress', 'progress', 'active', 'inprogress'].includes(raw)) return { key: 'in-progress', label: 'doing' };
    if (['review', 'in-review', 'in review'].includes(raw)) return { key: 'review', label: 'review' };
    if (['testing', 'test'].includes(raw)) return { key: 'default', label: 'testing' };
    if (['todo', 'to-do', 'backlog', 'pending', 'planning'].includes(raw)) return { key: 'default', label: raw };
    return { key: (raw as keyof typeof STATUS_CONFIG) in STATUS_CONFIG ? (raw as keyof typeof STATUS_CONFIG) : 'default', label: raw };
  };

  const normalized = normalizeStatus(projectStatus);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="relative flex justify-between items-center">
        {/* Status badge matching ProjectCard */}
        <div className="absolute -top-2 right-0 z-10">
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl backdrop-blur-lg bg-gradient-to-r ${STATUS_CONFIG[normalized.key].bg} border ${STATUS_CONFIG[normalized.key].border} shadow-lg ${STATUS_CONFIG[normalized.key].glow}`}>
            <span className={`${STATUS_CONFIG[normalized.key].text} font-semibold text-xs capitalize`}>{normalized.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 grid place-items-center">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          {editing ? (
            <input
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-2xl md:text-3xl font-bold text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-indigo-400 px-1"
              placeholder="Project name"
            />
          ) : (
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" /> Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Minimal Project Info */}
      <section className="relative bg-gradient-to-br from-slate-900/60 via-slate-800/30 to-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="text-sm text-gray-400">Status</label>
            {editing ? (
              <div className="mt-1">
                <StatusDropdown
                  statuses={customStatuses}
                  onStatusesChange={setCustomStatuses}
                  selectedStatus={form.status || 'planning'}
                  onStatusSelect={(status) => {
                    setForm({ ...form, status });
                    // Immediately update the project status when changed
                    handleProjectStatusChange(status);
                  }}
                  entityType="project"
                />
              </div>
            ) : (
              <div className={`inline-flex mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(projectStatus)}`}>
                {projectStatus?.charAt(0).toUpperCase() + projectStatus?.slice(1)}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-400">Team</label>
            {editing ? (
              <select
                value={form.teamId || ''}
                onChange={(e) => setForm({ ...form, teamId: Number(e.target.value) })}
                className="mt-1 bg-gray-800/60 text-white border border-white/10 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">Unassigned</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-white mt-1">{(project as any).team?.name || 'Unassigned'}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-400">Start Date</label>
            {editing ? (
              <input
                type="date"
                value={(form as any).startDate || (project.start_date ? new Date(project.start_date as any).toISOString().slice(0, 10) : '') as any}
                onChange={(e) => setForm({ ...form, ...(e.target.value ? { startDate: e.target.value } : {}) })}
                className="mt-1 bg-gray-800/60 text-white border border-white/10 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            ) : (
              <p className="text-white mt-1">{project.start_date ? formatDate(project.start_date as any) : 'Not set'}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-400">End Date</label>
            {editing ? (
              <input
                type="date"
                value={form.endDate || ''}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-1 bg-gray-800/60 text-white border border-white/10 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            ) : (
              <p className="text-white mt-1">{project.end_date ? formatDate(project.end_date) : 'Not set'}</p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400">Description</label>
          {editing ? (
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="mt-1 w-full bg-gray-800/60 text-gray-100 border border-white/10 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Optional description"
            />
          ) : (
            <p className="text-gray-200 mt-1">{project.description}</p>
          )}
        </div>
      </section>

      {/* Tasks */}
      <section className="bg-gray-900/90 border border-white/20 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Tasks</h2>
        </div>

        {canEdit && (
          <div className="bg-gradient-to-br from-slate-800/60 via-slate-700/30 to-slate-800/40 border border-indigo-500/30 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-indigo-300">Create New Task</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                placeholder="Task title *"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="bg-gray-800/60 text-gray-100 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                placeholder="Description (optional)"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="bg-gray-800/60 text-gray-100 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="date"
                value={taskForm.deadline || ''}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                className="bg-gray-800/60 text-gray-100 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <StatusDropdown
                statuses={customStatuses}
                onStatusesChange={setCustomStatuses}
                selectedStatus={taskForm.status || 'todo'}
                onStatusSelect={(status) => setTaskForm({ ...taskForm, status })}
                entityType="task"
              />
            </div>
            <div className="mt-3">
              <button
                onClick={createTaskInline}
                disabled={!taskForm.title.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingTasks ? (
            <div className="text-gray-400">Loading tasks...</div>
          ) : !Array.isArray(tasks) || tasks.length === 0 ? (
            <div className="text-gray-400">No tasks yet.</div>
          ) : (
            tasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateStatus={toggleTaskStatus}
                onDeleteTask={handleDeleteTask}
              />
            ))
          )}
        </div>
      </section>

      {/* Status management removed from admin project page; creation/management is available only in dedicated edit views. */}
    </div>
  );
}