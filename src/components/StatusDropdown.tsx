"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { StatusItem } from "@/types";
import AddStatusModal from "./AddStatusModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface StatusDropdownProps {
  statuses: StatusItem[];
  onStatusesChange: (statuses: StatusItem[]) => void;
  selectedStatus: string;
  onStatusSelect: (status: string) => void;
  entityType: 'project' | 'task';
  disabled?: boolean;
  hideLabel?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function StatusDropdown({
  statuses,
  onStatusesChange,
  selectedStatus,
  onStatusSelect,
  entityType,
  disabled = false,
  hideLabel = false,
  onOpenChange,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StatusItem | null>(null);

  // Use unified default statuses for all entity types
  const getDefaultStatuses = (): StatusItem[] => {
    return [
      { id: 1, title: 'To Do', description: 'Item is pending', color: '#6B7280', isDeletable: false },
      { id: 2, title: 'In Progress', description: 'Item is in progress', color: '#3B82F6', isDeletable: false },
      { id: 3, title: 'Testing', description: 'Item is being tested', color: '#F59E0B', isDeletable: false },
      { id: 4, title: 'Done', description: 'Item is completed', color: '#10B981', isDeletable: false }
    ];
  };

  const defaultStatuses = getDefaultStatuses();
  // Use a single effective list. If user hasn't customized yet, fall back to defaults.
  // Also ensure unique ids by remapping to a composite key for UI only.
  const effectiveStatuses = (statuses.length > 0 ? statuses : defaultStatuses).map((s, idx) => ({
    ...s,
    // Avoid duplicate keys across sessions/lists; keep id for data but expose a unique uiKey
    uiKey: `${s.id}-${s.title}-${idx}`,
  }));

  const handleAddStatus = (newStatus: StatusItem, insertIndex: number) => {
    const base = statuses.length > 0 ? [...statuses] : [...defaultStatuses];
    const clampedIndex = Math.max(0, Math.min(insertIndex, base.length));
    base.splice(clampedIndex, 0, newStatus);
    onStatusesChange(base);
  };

  const handleDeleteStatus = (statusId: number) => {
    const base = statuses.length > 0 ? [...statuses] : [...defaultStatuses];
    const status = base.find(s => s.id === statusId);
    if (!status) return;
    setPendingDelete(status);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const base = statuses.length > 0 ? [...statuses] : [...defaultStatuses];
    const updated = base.filter(s => s.id !== pendingDelete.id);
    onStatusesChange(updated);
    if (selectedStatus === pendingDelete.title && updated.length > 0) {
      onStatusSelect(updated[0].title);
    }
    setPendingDelete(null);
    setConfirmOpen(false);
  };

  const closeConfirm = () => {
    setPendingDelete(null);
    setConfirmOpen(false);
  };

  const selectedStatusData = effectiveStatuses.find(s => s.title.toLowerCase() === selectedStatus.toLowerCase());

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between min-h-[20px]">
        {!hideLabel && (
          <label className="text-sm font-medium text-slate-300 capitalize">
            {entityType} Status
          </label>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowAddModal(true);
          }}
          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest ml-auto"
          disabled={disabled}
        >
          <Plus className="h-3 w-3" />
          Add Custom Status
        </button>
      </div>

      {/* Custom Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            const next = !isOpen;
            setIsOpen(next);
            onOpenChange?.(next);
          }}
          disabled={disabled}
          className="w-full px-5 py-3.5 rounded-2xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed group shadow-inner"
        >
          <div className="flex items-center gap-2">
            {selectedStatusData && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedStatusData.color }}
              />
            )}
            <span className="capitalize">
              {selectedStatusData ? selectedStatusData.title : 'Select Status'}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl z-[9999] max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-slate-400 px-3 py-2 font-medium">Statuses</div>
              {effectiveStatuses.map((status) => (
                <div
                  key={status.uiKey}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onStatusSelect(status.title);
                      setIsOpen(false);
                      onOpenChange?.(false);
                    }}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <div className="flex-1">
                      <div className="text-white text-sm capitalize">{status.title}</div>
                      {status.description && (
                        <div className="text-slate-400 text-xs">{status.description}</div>
                      )}
                    </div>
                  </button>
                  {status.isDeletable !== false && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStatus(status.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                      title="Delete status"
                      disabled={disabled}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Status Button */}
            <div className="p-2 border-t border-slate-700/50">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(true);
                  setIsOpen(false);
                  onOpenChange?.(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Custom Status
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Status Modal */}
      <AddStatusModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddStatus={handleAddStatus}
        onDeleteStatus={handleDeleteStatus}
        existingStatuses={effectiveStatuses}
        entityType={entityType}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={confirmOpen}
        onClose={closeConfirm}
        onConfirm={confirmDelete}
        title="Delete Status"
        message="Are you sure you want to delete this status? This action cannot be undone."
        itemName={pendingDelete?.title}
      />
    </div>
  );
}
