"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import ProjectCard from "./ProjectCard";
import DeleteProjectModal from "./DeleteProjectModal";

interface ProjectsGridProps {
  projects: any[];
  loadingProjects: boolean;
  editProject: (project: any) => void;
  deleteProject: (projectId: number) => Promise<void>;
  // Server-side pagination props
  page?: number;
  total?: number;
  totalPages?: number;
  onChangePage?: (page: number) => void;
  search?: string;
  onChangeSearch?: (q: string) => void;
  perPage?: number;
}

export default function ProjectsGrid({ projects, loadingProjects, editProject, deleteProject, page = 1, total = 0, totalPages = 1, onChangePage, search = "", onChangeSearch, perPage = 2 }: ProjectsGridProps) {
  const router = useRouter();

  const [deleteProjectModal, setDeleteProjectModal] = useState<{ isOpen: boolean; project: any | null }>({ isOpen: false, project: null });
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(search);

  // Keep latest callback in a ref to avoid effect re-runs on parent re-render
  const onChangeSearchRef = useRef<ProjectsGridProps["onChangeSearch"]>(undefined);
  useEffect(() => {
    onChangeSearchRef.current = onChangeSearch;
  }, [onChangeSearch]);

  // Track last dispatched value to avoid duplicate fetches
  const lastSentRef = useRef<string>("__init__");

  // Debounce search updates to parent (only when value actually changes)
  useEffect(() => {
    const value = searchQuery.trim();
    if (value === lastSentRef.current) {
      return; // no change, skip scheduling
    }
    const handle = setTimeout(() => {
      if (onChangeSearchRef.current) {
        lastSentRef.current = value;
        onChangeSearchRef.current(value);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  // Sync incoming search prop to local state without causing loops
  useEffect(() => {
    const incoming = (search || "").trim();
    if (incoming !== searchQuery) {
      setSearchQuery(incoming);
    }
    // intentionally ignore searchQuery in deps to avoid feedback loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleOpenDeleteProject = (project: any) => {
    setDeleteProjectModal({ isOpen: true, project });
  };

  const handleConfirmDeleteProject = async () => {
    if (deleteProjectModal.project) {
      await deleteProject(deleteProjectModal.project.id);
      setMessage(`🗑️ Project deleted: ${deleteProjectModal.project.name}`);
      setDeleteProjectModal({ isOpen: false, project: null });
    }
  };

  return (
    <div className="w-full overflow-hidden">

      {/* Feedback message */}
      {message && (
        <div className="static mb-4 rounded-lg bg-blue-600/20 text-blue-300 px-4 py-2 text-sm">
          {message}
        </div>
      )}

      {/* Header with project count and page indicator */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-400">
            {total > 0 ? `${total} ${searchQuery ? 'filtered' : 'total'} projects` : 'No projects yet'}
          </p>
        </div>

        {/* Page indicator */}
        {totalPages > 1 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50">
            <span className="text-xs text-slate-400">Page</span>
            <span className="text-sm font-semibold text-white">{page}</span>
            <span className="text-xs text-slate-400">of {totalPages}</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-600/50 rounded-xl bg-slate-800/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(24rem,1fr))] gap-4 lg:gap-5">
        {loadingProjects ? (
          [...Array(3)].map((_, i) => (
            <div
              key={`s-${i}`}
              className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))
        ) : projects.length === 0 ? (
          <div className="text-center col-span-full mt-4">
            {searchQuery ? (
              <div>
                <p className="text-gray-400 mb-2">
                  No projects match your search for "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <p className="text-gray-400">
                No active projects found.
              </p>
            )}
          </div>
        ) : (
          projects.map((project, idx) => (
            <div key={project.id} className="h-full">
              <ProjectCard
                project={project}
                index={(page - 1) * perPage + idx}
                onOpenProject={() => handleOpenDeleteProject(project)}
                onEditProject={() => editProject(project)}
              />
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-700/50 mt-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Showing</span>
            <span className="font-semibold text-white">
              {(page - 1) * perPage + (projects.length > 0 ? 1 : 0)}-{(page - 1) * perPage + projects.length}
            </span>
            <span>of</span>
            <span className="font-semibold text-white">{total}</span>
            <span>projects</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => onChangePage && onChangePage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-800/60 text-sm font-medium text-white hover:bg-slate-700/60 hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/60 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onChangePage && onChangePage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${pageNum === page
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white border border-purple-500/50 shadow-lg'
                        : 'border border-slate-600/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500/50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={() => onChangePage && onChangePage(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-800/60 text-sm font-medium text-white hover:bg-slate-700/60 hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/60 transition-all"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      <DeleteProjectModal
        isOpen={deleteProjectModal.isOpen}
        onClose={() => setDeleteProjectModal({ isOpen: false, project: null })}
        onConfirm={handleConfirmDeleteProject}
        projectName={deleteProjectModal.project?.name || ""}
      />
    </div>
  );
}
