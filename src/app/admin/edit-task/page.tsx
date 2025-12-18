"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Edit3, User, Calendar, Clock, Flag, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import useAdminData from "../hooks/useAdminData";

function EditTaskPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams?.get('taskId');
  const { users } = useAdminData();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    status: "todo" as "todo" | "in-progress" | "review" | "completed",
    assignedToId: "",
    assigneeIds: [] as number[],
    dueDate: "",
    estimatedHours: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<any>(null);

  // Redirect if no taskId
  useEffect(() => {
    if (!taskId) {
      router.push('/admin');
    }
  }, [taskId, router]);

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      
      try {
        setLoadingTask(true);
        const response = await fetch(`/api/tasks/${taskId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch task');
        }
        
        const responseData = await response.json();
        const taskData = responseData.task;
        setTask(taskData);
        
        // Populate form with task data
        const assigneeIds = taskData.assignees ? taskData.assignees.map((assignee: any) => assignee.id) : [];
        setFormData({
          title: taskData.title || "",
          description: taskData.description || "",
          priority: taskData.priority || "medium",
          status: taskData.status || "todo",
          assignedToId: taskData.assignedToId ? taskData.assignedToId.toString() : "",
          assigneeIds: assigneeIds,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : "",
          estimatedHours: taskData.estimatedHours ? taskData.estimatedHours.toString() : "",
        });
      } catch (error: any) {
        console.error('Error fetching task:', error);
        setError('Failed to load task data');
        toast.error('Failed to load task data');
      } finally {
        setLoadingTask(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation
    if (!formData.title.trim()) {
      setError("Task title is required");
      setLoading(false);
      return;
    }

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        status: formData.status,
        assigneeIds: formData.assigneeIds.length > 0 ? formData.assigneeIds : undefined,
        assignedToId: formData.assigneeIds.length === 0 && formData.assignedToId ? parseInt(formData.assignedToId) : undefined,
        dueDate: formData.dueDate || null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to update task');
      }

      toast.success('Task updated successfully!');
      router.push('/admin');
    } catch (error: any) {
      console.error("Error updating task:", error);
      setError(error.message || "Failed to update task");
      toast.error(error.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssigneeToggle = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId]
    }));
  };

  const handleSelectAllAssignees = () => {
    const allUserIds = users.map(user => user.id);
    const allSelected = allUserIds.every(id => formData.assigneeIds.includes(id));
    
    setFormData(prev => ({
      ...prev,
      assigneeIds: allSelected ? [] : allUserIds
    }));
  };

  if (!taskId) {
    return null;
  }

  if (loadingTask) {
    return (
      <div className="relative min-h-screen bg-[#0b0b10] text-white overflow-hidden">
        {/* Ambient gradient blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Loading task data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0b0b10] text-white overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="px-6 md:px-10 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/30 to-purple-500/30 border border-orange-400/30 flex items-center justify-center backdrop-blur-sm">
                <Edit3 className="h-6 w-6 text-orange-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Edit Task</h1>
                <p className="text-sm text-gray-300 mt-1">{task?.title ? `Editing: ${task.title}` : 'Update task details'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.35)] space-y-8">
            {error && (
              <div className="bg-gradient-to-r from-red-600/15 to-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-300 text-sm flex items-center gap-3 backdrop-blur-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-red-200/80">{error}</p>
                </div>
              </div>
            )}

            {/* Title Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                  <Flag className="w-3 h-3 text-blue-300" />
                </div>
                Task Title *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm relative z-10"
                  placeholder="Enter task title..."
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500/30 to-teal-500/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                Description
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm relative z-10 resize-none"
                  placeholder="Enter task description..."
                  rows={4}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-teal-500/5 pointer-events-none"></div>
              </div>
            </div>

            {/* Priority, Status, and Assignee Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Priority Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
                    <Flag className="w-3 h-3 text-red-300" />
                  </div>
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm relative z-10 appearance-none cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/5 to-orange-500/5 pointer-events-none"></div>
                </div>
              </div>

              {/* Status Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-purple-300" />
                  </div>
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm relative z-10 appearance-none cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
                </div>
              </div>

              {/* Assignees Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/30 to-blue-500/30 flex items-center justify-center">
                    <User className="w-3 h-3 text-indigo-300" />
                  </div>
                  Assignees
                </label>
                <div className="relative">
                  <div className="bg-gray-800/50 border border-white/10 rounded-2xl backdrop-blur-sm relative z-10">
                    <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                      {/* Select All Option */}
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={handleSelectAllAssignees}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                          users.every(user => formData.assigneeIds.includes(user.id))
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-gray-400 hover:border-indigo-400'
                        }`}>
                          {users.every(user => formData.assigneeIds.includes(user.id)) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-indigo-300">Select All</span>
                      </div>
                      
                      {/* Individual User Options */}
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleAssigneeToggle(user.id)}>
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            formData.assigneeIds.includes(user.id)
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'border-gray-400 hover:border-indigo-400'
                          }`}>
                            {formData.assigneeIds.includes(user.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm text-gray-200">{user.name}</span>
                          <span className="text-xs text-gray-400 ml-auto">{user.email}</span>
                        </div>
                      ))}
                      
                      {users.length === 0 && (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No users available
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 pointer-events-none"></div>
                </div>
                {formData.assigneeIds.length > 0 && (
                  <div className="text-xs text-gray-400">
                    {formData.assigneeIds.length} assignee{formData.assigneeIds.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            </div>

            {/* Due Date and Estimated Hours Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Due Date Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-cyan-300" />
                  </div>
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm relative z-10"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pointer-events-none"></div>
                </div>
              </div>

              {/* Estimated Hours Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center">
                    <Clock className="w-3 h-3 text-yellow-300" />
                  </div>
                  Estimated Hours
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-300 backdrop-blur-sm relative z-10"
                    placeholder="e.g., 2.5 hours"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 mt-8 border-t border-white/10">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                disabled={loading}
                className="px-6 py-3 text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/60 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-sm flex items-center justify-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 via-purple-600 to-orange-700 hover:from-orange-700 hover:via-purple-700 hover:to-orange-800 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-orange-500/30 transform hover:scale-105 disabled:hover:scale-100 backdrop-blur-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="relative z-10">Updating Task...</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                    <span className="relative z-10">Update Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function EditTaskPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-600 border-t-purple-500"></div>
    </div>}>
      <EditTaskPageContent />
    </Suspense>
  );
}