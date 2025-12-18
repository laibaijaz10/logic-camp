import { getProjectById } from '@/app/services/projectService';
import { getTasksByProject } from '@/services/taskService';
import AdminProjectDetails from '../components/AdminProjectDetails';
import ProjectDetailsLoader from '../components/ProjectDetailsLoader';
import AdminProjectLayout from '../components/AdminProjectLayout';

export default async function AdminProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const projectId = Number(resolvedParams.id);

  try {
    const project = await getProjectById(projectId);
    const { tasks: initialTasks } = await getTasksByProject(projectId);

    const statusTitle = (project as any)?.status_title || (project as any)?.status || 'todo';
    const teamMembersCount = Array.isArray((project as any)?.members) ? (project as any).members.length : 0;
    const tasksCount = Array.isArray(initialTasks) ? initialTasks.length : 0;

    return (
      <AdminProjectLayout>
        {/* Page header */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-6">
            {/* Breadcrumbs */}
            <nav className="text-sm text-gray-400 mb-3" aria-label="Breadcrumb">
              <ol className="inline-flex items-center gap-2">
                <li className="hover:text-gray-200 transition-colors"><a href="/admin">Admin</a></li>
                <li className="opacity-50">/</li>
                <li className="hover:text-gray-200 transition-colors"><a href="/admin">Projects</a></li>
                <li className="opacity-50">/</li>
                <li className="text-gray-200 truncate max-w-[40ch]" title={project?.name}>{project?.name}</li>
              </ol>
            </nav>

            {/* Title row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{project?.name}</h1>
                <p className="text-gray-400 mt-1 truncate max-w-3xl">{project?.description || 'No description provided.'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-sm capitalize">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/80" />
                  {statusTitle}
                </span>
                <a
                  href="/admin"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm transition-colors"
                >
                  ← Back to Dashboard
                </a>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wider text-gray-400">Start Date</div>
                <div className="text-white mt-1">{(project as any)?.start_date ? new Date((project as any).start_date).toLocaleDateString() : 'Not set'}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wider text-gray-400">End Date</div>
                <div className="text-white mt-1">{(project as any)?.end_date ? new Date((project as any).end_date).toLocaleDateString() : 'Not set'}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wider text-gray-400">Team Members</div>
                <div className="text-white mt-1">{teamMembersCount}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wider text-gray-400">Tasks</div>
                <div className="text-white mt-1">{tasksCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-7xl px-0 py-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <AdminProjectDetails project={project} initialTasks={initialTasks} />
          </div>
        </div>
      </AdminProjectLayout>
    );
  } catch (_e) {
    // Network/URL issues -> client fallback
    return <ProjectDetailsLoader projectId={Number(resolvedParams.id)} />;
  }
}