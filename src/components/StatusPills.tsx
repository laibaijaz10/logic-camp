"use client";

import React, { useCallback, useMemo } from "react";

interface StatusPillsProps {
  currentStatus: string | null | undefined;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const PROJECT_STATUSES = ["To Do", "Doing", "Testing", "Done"] as const;

type ProjectStatus = (typeof PROJECT_STATUSES)[number];

const STATUS_COLORS: Record<ProjectStatus, string> = {
  "To Do": "bg-slate-800 text-slate-100 border-slate-600",
  "Doing": "bg-blue-600/20 text-blue-300 border-blue-500/70",
  "Testing": "bg-amber-500/20 text-amber-200 border-amber-400/70",
  "Done": "bg-emerald-500/20 text-emerald-200 border-emerald-400/70",
};

function normalizeToProjectStatus(value: string | null | undefined): ProjectStatus {
  if (!value) return "To Do";
  const raw = value.trim().toLowerCase();
  if (["todo", "to-do", "backlog", "pending"].includes(raw)) return "To Do";
  if (["doing", "in progress", "in-progress", "inprogress", "active", "progress"].includes(raw)) return "Doing";
  if (["testing", "test"].includes(raw)) return "Testing";
  if (["done", "completed", "complete", "finished"].includes(raw)) return "Done";
  // Fallback: try to match by capitalized version
  const capitalized = value
    .toLowerCase()
    .replace(/(^|\s)([a-z])/g, (_, s, c) => s + c.toUpperCase());
  if ((PROJECT_STATUSES as readonly string[]).includes(capitalized)) {
    return capitalized as ProjectStatus;
  }
  return "To Do";
}

export default function StatusPills({
  currentStatus,
  onStatusChange,
  disabled = false,
  ariaLabel = "Project status",
}: StatusPillsProps) {
  const normalized = useMemo(
    () => normalizeToProjectStatus(currentStatus || ""),
    [currentStatus]
  );

  const handleKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLDivElement>,
      index: number
    ) => {
      if (disabled) return;
      const key = event.key;
      const maxIndex = PROJECT_STATUSES.length - 1;

      if (key === "ArrowRight" || key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = index === maxIndex ? 0 : index + 1;
        onStatusChange(PROJECT_STATUSES[nextIndex]);
      } else if (key === "ArrowLeft" || key === "ArrowUp") {
        event.preventDefault();
        const prevIndex = index === 0 ? maxIndex : index - 1;
        onStatusChange(PROJECT_STATUSES[prevIndex]);
      } else if (key === "Enter" || key === " ") {
        event.preventDefault();
        onStatusChange(PROJECT_STATUSES[index]);
      }
    },
    [onStatusChange, disabled]
  );

  return (
    <div
      className="relative flex items-center"
      aria-label={ariaLabel}
      role="radiogroup"
    >
      <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex-nowrap py-1 px-1 -mx-1">
        {PROJECT_STATUSES.map((status, index) => {
          const isActive = status === normalized;
          const baseColors = STATUS_COLORS[status];

          return (
            <div
              key={status}
              role="radio"
              aria-checked={isActive}
              aria-disabled={disabled}
              tabIndex={disabled ? -1 : isActive ? 0 : -1}
              className={`inline-flex items-center justify-center px-3 py-1 rounded-full border text-xs font-semibold whitespace-nowrap cursor-pointer select-none transition-all duration-200 ease-out ${baseColors} ${
                isActive
                  ? "shadow-[0_0_0_1px_rgba(255,255,255,0.2)] scale-[1.02]"
                  : "opacity-70 hover:opacity-100 hover:scale-[1.01]"
              } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              onClick={() => {
                if (disabled) return;
                onStatusChange(status);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <span className="capitalize">{status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
