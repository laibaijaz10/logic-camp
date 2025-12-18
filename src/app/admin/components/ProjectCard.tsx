"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  FolderKanban,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Project } from "../hooks/useAdminData";
import StatusPills from "@/components/StatusPills";
import { updateProjectStatus } from "@/services/projectService";

// Types
interface ProjectCardProps {
  project: Project;
  index: number;
  onOpenProject?: (project: Project) => void;
  onEditProject?: () => void;
}

interface Owner {
  name: string;
}

interface StatusTheme {
  bg: string;
  border: string;
  text: string;
  glow: string;
}

// Constants
const STATUS_CONFIG = {
  completed: {
    bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    icon: CheckCircle
  },
  'in-progress': {
    bg: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    icon: Zap
  },
  review: {
    bg: 'from-purple-500/10 via-violet-500/5 to-fuchsia-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
    icon: AlertCircle
  },
  default: {
    bg: 'from-gray-500/10 via-slate-500/5 to-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    glow: 'shadow-gray-500/20',
    icon: Clock
  }
} as const;

// Helper functions
const getRemainingDays = (project: Project): number | null => {
  const endDate = (project as any).endDate || (project as any).end_date;
  if (!endDate) return null;

  const today = new Date();
  const deadline = new Date(endDate);
  if (Number.isNaN(deadline.getTime())) return null;

  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getStatusTheme = (status: string): StatusTheme => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default;
};

// Normalize incoming status values to a consistent config key and label
const normalizeStatus = (statusTitle?: string, statuses?: Array<{ id: number; title: string; description?: string; color: string }> | null): { key: keyof typeof STATUS_CONFIG; label: string } => {
  if (!statusTitle) return { key: 'default', label: 'todo' };

  const raw = statusTitle.trim().toLowerCase();
  if (['done', 'completed', 'complete', 'finished'].includes(raw)) return { key: 'completed', label: 'done' };
  if (['doing', 'in-progress', 'in progress', 'progress', 'inprogress'].includes(raw)) return { key: 'in-progress', label: 'doing' };
  if (['review', 'in-review', 'in review'].includes(raw)) return { key: 'review', label: 'review' };
  if (['testing', 'test'].includes(raw)) return { key: 'default', label: 'testing' };
  if (['todo', 'to-do', 'backlog', 'pending'].includes(raw)) return { key: 'default', label: 'todo' };
  // Fallback
  return { key: (raw as keyof typeof STATUS_CONFIG) in STATUS_CONFIG ? (raw as keyof typeof STATUS_CONFIG) : 'default', label: raw };
};

const getStatusIcon = (status: string) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default;
  const IconComponent = config.icon;
  return <IconComponent className="h-4 w-4" />;
};

const formatDeadlineText = (remainingDays: number | null): string => {
  if (remainingDays === null) return "No deadline";
  if (remainingDays > 0) return `${remainingDays}d left`;
  if (remainingDays === 0) return "Due today";
  return `${Math.abs(remainingDays)}d overdue`;
};

// Sub-components


const StatusBadge: React.FC<{
  statusKey: keyof typeof STATUS_CONFIG;
  statusLabel: string;
  statusTheme: StatusTheme;
  isHovered: boolean;
}> = ({ statusKey, statusLabel, statusTheme, isHovered }) => {
  if (!statusKey) return null;

  return (
    <div className="absolute top-2 right-2 z-20">
      <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl backdrop-blur-lg
        bg-gradient-to-r ${statusTheme.bg} border ${statusTheme.border}
        shadow-lg`}>
        <span className={statusTheme.text}>
          {getStatusIcon(statusKey)}
        </span>
        <span className={`capitalize font-semibold text-xs ${statusTheme.text}`}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
};

const ProjectHeader: React.FC<{
  project: Project;
  isHovered: boolean;
}> = ({ project, isHovered }) => (
  <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
    {/* Project Icon */}
    <div className={`shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 
      grid place-items-center shadow-indigo-500/20 shadow-xl relative overflow-hidden`}>
      <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 text-white relative z-10" />
    </div>

    {/* Title and Description */}
    <div className="min-w-0 flex-1 overflow-hidden">
      <h3 className="font-bold text-sm sm:text-lg leading-tight line-clamp-2 text-white truncate">
        {project.name}
      </h3>
      <p className="mt-1 sm:mt-2 text-xs sm:text-sm line-clamp-2 text-gray-400 break-words">
        {project.description}
      </p>
    </div>
  </div>
);

const StatsGrid: React.FC<{
  project: Project;
  owner: Owner | null;
  remainingDays: number | null;
  isHovered: boolean;
}> = ({ project, owner, remainingDays, isHovered }) => (
  <div className="mb-3 sm:mb-4">
    {/* Team and Deadline Row */}
    <div className="grid grid-cols-2 gap-2">
      {/* Members Count */}
      <StatItem
        icon={Users}
        label="Team"
        value={(Array.isArray(project.team?.members) ? project.team?.members?.length : Array.isArray((project as any).members) ? (project as any).members.length : 0)}
        color="purple"
        isHovered={isHovered}
      />

      {/* Deadline */}
      {((project as any).endDate || (project as any).end_date) ? (
        <StatItem
          icon={Clock}
          label="Deadline"
          value={formatDeadlineText(remainingDays)}
          subValue={new Date(((project as any).endDate || (project as any).end_date)).toLocaleDateString()}
          color={remainingDays !== null && remainingDays < 0 ? "red" : "amber"}
          isHovered={isHovered}
        />
      ) : (
        <div className="h-full"></div>
      )}
    </div>
  </div>
);

const StatItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  color: 'purple' | 'indigo' | 'red' | 'amber';
  isHovered: boolean;
  truncate?: boolean;
  fullWidth?: boolean;
}> = ({ icon: Icon, label, value, subValue, color, isHovered, truncate = false, fullWidth = false }) => {
  const colorClasses = {
    purple: {
      bg: isHovered ? 'bg-purple-500/20 border-purple-400/40 shadow-lg shadow-purple-500/20' : 'bg-purple-500/10 border-purple-500/20',
      icon: isHovered ? 'text-purple-300' : 'text-purple-400',
      text: isHovered ? 'text-purple-300' : 'text-purple-400',
      iconBg: 'bg-purple-500/20'
    },
    indigo: {
      bg: isHovered ? 'bg-indigo-500/20 border-indigo-400/40 shadow-lg shadow-indigo-500/20' : 'bg-indigo-500/10 border-indigo-500/20',
      icon: isHovered ? 'text-indigo-300' : 'text-indigo-400',
      text: isHovered ? 'text-indigo-300' : 'text-indigo-400',
      iconBg: 'bg-indigo-500/20'
    },
    red: {
      bg: isHovered ? 'bg-red-500/20 border-red-400/40 shadow-lg shadow-red-500/20' : 'bg-red-500/10 border-red-500/20',
      icon: isHovered ? 'text-red-300' : 'text-red-400',
      text: isHovered ? 'text-red-300' : 'text-red-400',
      iconBg: 'bg-red-500/20'
    },
    amber: {
      bg: isHovered ? 'bg-amber-500/20 border-amber-400/40 shadow-lg shadow-amber-500/20' : 'bg-amber-500/10 border-amber-500/20',
      icon: isHovered ? 'text-amber-300' : 'text-amber-400',
      text: isHovered ? 'text-amber-300' : 'text-amber-400',
      iconBg: 'bg-amber-500/20'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`${fullWidth ? 'w-full' : 'h-full'} flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all duration-300 ${classes.bg}`}>
      <div className={`p-0.5 sm:p-1 ${classes.iconBg} rounded-md sm:rounded-lg`}>
        <Icon className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-300 ${classes.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">{label}</p>
        <p className={`font-bold text-xs sm:text-sm transition-colors duration-300 ${classes.text} ${truncate ? 'truncate' : ''}`}>
          {value} {subValue && <span className="text-xs text-gray-400 hidden sm:inline">{subValue}</span>}
        </p>
      </div>
    </div>
  );
};

const ProjectFooter: React.FC<{
  project: Project;
  owner: Owner | null;
  isHovered: boolean;
  onEditClick: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
  onEditProject?: () => void;
  onOpenProject?: (project: Project) => void;
}> = ({ project, owner, isHovered, onEditClick, onDeleteClick, onEditProject, onOpenProject }) => (
  <div className="flex flex-col gap-3">
    {/* Owner and Last Updated Row */}
    <div className="flex items-center gap-2">
      {/* Owner */}
      {owner && (
        <StatItem
          icon={Star}
          label="Owner"
          value={owner.name}
          subValue={`(ID: ${((project as any).ownerId || (project as any).owner_id)})`}
          color="indigo"
          isHovered={isHovered}
          truncate
        />
      )}

      {/* Updated Date */}
      <div className={`flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all duration-300 flex-1
        ${isHovered
          ? 'bg-cyan-500/20 border-cyan-400/40 shadow-lg shadow-cyan-500/20'
          : 'bg-cyan-500/10 border-cyan-500/20'
        }`}>
        <div className="p-0.5 sm:p-1 bg-cyan-500/20 rounded-md sm:rounded-lg">
          <Calendar className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-300 ${isHovered ? 'text-cyan-300' : 'text-cyan-400'}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">Last Updated</p>
          <p className={`font-semibold text-xs transition-colors duration-300 ${isHovered ? 'text-cyan-300' : 'text-cyan-400'}`}>
            {new Date(project.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>

    {/* Action Buttons Row */}
    <div className="flex gap-1.5 sm:gap-2 justify-between">
      {onEditProject && (
        <ActionButton
          icon={Edit}
          label="Edit"
          onClick={onEditClick}
          variant="indigo"
          isHovered={isHovered}
        />
      )}
      {onOpenProject && (
        <ActionButton
          icon={Trash2}
          label="Remove"
          onClick={onDeleteClick}
          variant="red"
          isHovered={isHovered}
        />
      )}
    </div>
  </div>
);

const ActionButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant: 'indigo' | 'red';
  isHovered: boolean;
}> = ({ icon: Icon, label, onClick, variant, isHovered }) => {
  const variantClasses = {
    indigo: {
      bg: isHovered
        ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-lg shadow-indigo-500/20'
        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-400/40'
    },
    red: {
      bg: isHovered
        ? 'bg-red-500/20 border-red-400/40 text-red-300 shadow-lg shadow-red-500/20'
        : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400/40'
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border font-semibold text-xs transition-colors duration-300
        flex items-center justify-center gap-1 relative z-20
        ${variantClasses[variant].bg}`}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};



const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  onOpenProject,
  onEditProject
}) => {
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [statusTitle, setStatusTitle] = useState<string>((project as any).status_title || "To Do");

  // Calculate values
  const remainingDays = getRemainingDays(project);
  const normalized = normalizeStatus(statusTitle, (project as any).statuses);
  const statusTheme = getStatusTheme(normalized.key);

  // Set owner from project relation
  useEffect(() => {
    const relOwner = (project as any).owner;
    if (relOwner?.name) {
      setOwner({ name: relOwner.name });
    } else {
      setOwner(null);
    }
  }, [project]);

  // Keep local status in sync if project changes externally
  useEffect(() => {
    setStatusTitle((project as any).status_title || "To Do");
  }, [project]);

  // Event handlers
  const handleCardClick = () => {
    router.push(`/admin/projects/${project.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditProject?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenProject?.(project);
  };

  return (
    <div
      className="group transform w-full mx-auto h-full"
      style={{ animationDelay: `${0.1 * index}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={handleCardClick}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
        className="relative h-full flex flex-col text-left w-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-800/30 to-slate-900/40 shadow-xl cursor-pointer overflow-hidden"
      >
        {/* Status Badge */}
        <StatusBadge
          statusKey={normalized.key}
          statusLabel={normalized.label}
          statusTheme={statusTheme}
          isHovered={isHovered}
        />

        {/* Inline status pills control */}
        <div className="absolute top-11 right-2 z-20 max-w-[70%]">
          <StatusPills
            currentStatus={statusTitle}
            ariaLabel={`Project ${project.name} status`}
            onStatusChange={async (nextStatus) => {
              setStatusTitle(nextStatus);
              try {
                await updateProjectStatus(project.id, nextStatus);
              } catch (error) {
                console.error("Failed to update project status", error);
              }
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 p-3 sm:p-4 flex-1 flex flex-col">
          <ProjectHeader
            project={project}
            isHovered={isHovered}
          />

          <div className="flex-1">
            <StatsGrid
              project={project}
              owner={owner}
              remainingDays={remainingDays}
              isHovered={isHovered}
            />
          </div>

          <ProjectFooter
            project={project}
            owner={owner}
            isHovered={isHovered}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onEditProject={onEditProject}
            onOpenProject={onOpenProject}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;