"use client";

import { X } from "lucide-react";

import { formatDate } from "../../../utils/helpers";


interface UserProjectDetailsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

function getStatusColor(status: string) {
  switch (status) {
    case "planning": return "text-blue-400 bg-blue-400/10";
    case "active": return "text-green-400 bg-green-400/10";
    case "on-hold": return "text-yellow-400 bg-yellow-400/10";
    case "completed": return "text-emerald-400 bg-emerald-400/10";
    case "cancelled": return "text-red-400 bg-red-400/10";
    default: return "text-gray-400 bg-gray-400/10";
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent": return "text-red-400 bg-red-400/10";
    case "high": return "text-orange-400 bg-orange-400/10";
    case "medium": return "text-yellow-400 bg-yellow-400/10";
    case "low": return "text-green-400 bg-green-400/10";
    default: return "text-gray-400 bg-gray-400/10";
  }
}

export default function UserProjectDetailsModal({ project, isOpen, onClose }: UserProjectDetailsModalProps) {
  if (!isOpen || !project) return null;

  const assignDate = project.ProjectMembers?.[0]?.joinedAt ? formatDate(project.ProjectMembers[0].joinedAt) : "Not available";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 animate-fadeIn" onClick={onClose}>
      <div
        className="bg-gray-900/90 border border-white/20 backdrop-blur-xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_12px_40px_rgba(0,0,0,0.35)] relative animate-scaleIn text-gray-100 p-6 space-y-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold text-white">{project.name}</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6">
          {/* Project Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">📊 Status</label>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || "Unknown"}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">🔥 Priority</label>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                {project.priority?.charAt(0).toUpperCase() + project.priority?.slice(1) || "Unknown"}
              </div>
            </div>

            {/* Assign Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">📅 Assign Date</label>
              <p className="text-white">{assignDate}</p>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">🏁 End Date</label>
              <p className="text-white">{formatDate(project.endDate) || "Not set"}</p>
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">👥 Team Members</label>
              <p className="text-white">{project.members?.map((m: any) => m.name).join(", ") || "No members"}</p>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">📝 Description</label>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-200 leading-relaxed text-base">{project.description}</p>
              </div>
            </div>
          )}

          {/* Tasks */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">✅ Tasks</label>
            {project.tasks?.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-200">
                {project.tasks.map((task: any) => (
                  <li key={task.id}>{task.title} - {task.status}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No tasks assigned yet.</p>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}