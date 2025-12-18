"use client";

import { useState, useEffect } from "react";
import { X, Plus, Save, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { StatusItem } from "@/types";

interface AddStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStatus: (status: StatusItem, insertIndex: number) => void;
  onDeleteStatus?: (statusId: number) => void;
  existingStatuses: StatusItem[];
  entityType: 'project' | 'task';
}

export default function AddStatusModal({
  isOpen,
  onClose,
  onAddStatus,
  onDeleteStatus,
  existingStatuses,
  entityType
}: AddStatusModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: "#3B82F6",
    insertPosition: "end" as "start" | "end" | "custom"
  });
  const [customIndex, setCustomIndex] = useState(1);
  const [loading, setLoading] = useState(false);

  // Treat existingStatuses as the single authoritative list (defaults included upstream)
  const allStatuses = existingStatuses;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        color: "#3B82F6",
        insertPosition: "end"
      });
      setCustomIndex(1);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    
    if (!formData.title.trim()) {
      toast.error("Status title is required");
      return;
    }

    // Check if status with same title already exists
    if (allStatuses.some(s => s.title.toLowerCase() === formData.title.toLowerCase())) {
      toast.error("A status with this title already exists");
      return;
    }

    setLoading(true);

    try {
      const maxId = Math.max(...allStatuses.map(s => s.id), 0);
      const newStatus: StatusItem = {
        id: maxId + 1,
        title: formData.title.trim(),
        description: formData.description.trim(),
        color: formData.color
      };

      // Calculate insert index based on position against the full list
      let insertIndex = 0;
      switch (formData.insertPosition) {
        case "start":
          insertIndex = 0;
          break;
        case "end":
          insertIndex = allStatuses.length;
          break;
        case "custom":
          insertIndex = Math.max(0, Math.min(customIndex - 1, allStatuses.length));
          break;
      }

      onAddStatus(newStatus, insertIndex);
      onClose();
      toast.success("Status added successfully!");
    } catch (error) {
      console.error("Failed to add status:", error);
      toast.error("Failed to add status");
    } finally {
      setLoading(false);
    }
  };

  // Position management functions
  const handleInsertPositionChange = (position: "start" | "end" | "custom") => {
    setFormData(prev => ({ ...prev, insertPosition: position }));
    if (position === "custom") {
      setCustomIndex(1);
    }
  };

  const movePositionUp = () => {
    if (formData.insertPosition === "custom" && customIndex > 1) {
      setCustomIndex(customIndex - 1);
    }
  };

  const movePositionDown = () => {
    const maxPosition = allStatuses.length + 1;
    if (formData.insertPosition === "custom" && customIndex < maxPosition) {
      setCustomIndex(customIndex + 1);
    }
  };

  const handleDeleteStatus = (statusId: number) => {
    if (onDeleteStatus) {
      onDeleteStatus(statusId);
      toast.success("Status deleted successfully!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-label={`Add ${entityType} status`}>
      <div className="bg-slate-800/90 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Add Custom {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Status
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Status Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Status Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && formData.title.trim()) {
                  handleSubmit();
                }
              }}
              placeholder="e.g., In Review, Blocked, On Hold"
              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
              autoFocus
            />
            <div className="text-xs text-slate-500">Choose a short, descriptive title.</div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description for this status"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
            />
            <div className="text-xs text-slate-500">Optional. Helps teammates understand when to use this.</div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-12 rounded-lg border border-slate-600/50 cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm text-slate-400">
                  This color will be used to represent the status in the UI
                </div>
              </div>
            </div>
          </div>

          {/* Insert Position - Draggable Interface */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Insert Position</label>
            <div className="space-y-3">
              {/* Quick Position Options */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleInsertPositionChange("start")}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    formData.insertPosition === "start"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                  }`}
                >
                  At Start
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertPositionChange("end")}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    formData.insertPosition === "end"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                  }`}
                >
                  At End
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertPositionChange("custom")}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    formData.insertPosition === "custom"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                  }`}
                >
                  Custom Position
                </button>
              </div>

              {/* Status List */}
              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 space-y-2">
                <div className="text-xs text-slate-400 font-medium mb-2 flex items-center justify-between">
                  <span>Arrange where the new status will appear</span>
                  <span className="text-[10px] text-slate-500">Total: {allStatuses.length}</span>
                </div>
                
                {/* Start Position Indicator */}
                {formData.insertPosition === "start" && (
                  <div className="flex items-center gap-2 p-1.5 bg-indigo-600/20 border border-indigo-500/50 rounded">
                    <div className="text-indigo-400">
                      <Plus className="h-3 w-3" />
                    </div>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="text-indigo-300 text-xs font-medium">
                      {formData.title || "New Status"} (At Start)
                    </span>
                  </div>
                )}

                {/* Custom Position Indicator */}
                {formData.insertPosition === "custom" && (
                  <div className="flex items-center gap-2 p-1.5 bg-indigo-600/20 border border-indigo-500/50 rounded">
                    <div className="text-indigo-400">
                      <Plus className="h-3 w-3" />
                    </div>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="text-indigo-300 text-xs font-medium flex-1">
                      {formData.title || "New Status"} (Position {customIndex})
                    </span>
                    {/* Position Controls */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={movePositionUp}
                        disabled={customIndex <= 1}
                        className="p-0.5 text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={movePositionDown}
                        disabled={customIndex >= allStatuses.length + 1}
                        className="p-0.5 text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Current Statuses (unified) */}
                <div className="text-xs text-slate-400 px-1">Current Statuses</div>
                {allStatuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center gap-2 p-1.5 bg-slate-600/30 border border-slate-500/30 rounded hover:bg-slate-600/50 transition-colors"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-white text-xs capitalize flex-1">
                      {status.title}
                    </span>
                    {status.isDeletable !== false && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStatus(status.id)}
                        className="text-red-400 hover:text-red-300 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500 rounded"
                        title="Delete status"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    )}
                  </div>
                ))}

                {/* End Position Indicator */}
                {formData.insertPosition === "end" && (
                  <div className="flex items-center gap-2 p-1.5 bg-indigo-600/20 border border-indigo-500/50 rounded">
                    <div className="text-indigo-400">
                      <Plus className="h-3 w-3" />
                    </div>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="text-indigo-300 text-xs font-medium">
                      {formData.title || "New Status"} (At End)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Preview</label>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="text-white text-sm font-medium capitalize">
                  {formData.title || "New Status"}
                </span>
                {formData.description && (
                  <span className="text-slate-400 text-xs">
                    - {formData.description}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Status
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
