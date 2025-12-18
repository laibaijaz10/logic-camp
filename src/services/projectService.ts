import { Project } from '@/types';
import { db } from '@/lib/mockData';

export const getProjects = async (): Promise<Project[]> => {
  return db.getProjects();
};

export const getProjectById = async (id: number): Promise<Project> => {
  const projects = db.getProjects();
  const project = projects.find(p => p.id === Number(id));
  if (!project) throw new Error("Project not found");
  return project;
};

export const updateProjectStatus = async (id: number, statusTitle: string) => {
  const project = db.updateProject(id, { status_title: statusTitle });
  if (!project) throw new Error("Project not found");
  return project;
};

// Update any project fields (admin or team lead as allowed by API)
export const updateProject = async (
  id: number,
  updates: Partial<{
    name: string;
    description: string;
    statusTitle: string;
    startDate: string;
    endDate: string;
    teamId: number;
  }>
) => {
  // Map internal field names if necessary
  const projectUpdates: Partial<Project> = {
    ...updates,
    status_title: updates.statusTitle,
  } as any;

  const project = db.updateProject(id, projectUpdates);
  if (!project) throw new Error('Failed to update project');
  return project;
};

export type { Project };

// Regular project creation (for non-admin users)
export const createProject = async (project: Omit<Project, "id">) => {
  return db.createProject(project);
};

// Admin-specific project creation with team
export const createProjectWithTeam = async (
  project: {
    name: string;
    description: string;
    teamId: number;
    statusTitle?: string;
  },
  token: string
) => {
  const newProject = db.createProject({
    ...project,
    status_title: project.statusTitle || 'To Do',
    team_id: project.teamId,
    owner_id: 1, // Mock owner
  } as any);
  return newProject;
};
