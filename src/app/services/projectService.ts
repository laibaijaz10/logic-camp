import { db } from '@/lib/mockData';
import { Project } from '@/types';

export const getProjects = async (): Promise<Project[]> => {
  return db.getProjects();
};

export const getProjectById = async (id: number): Promise<Project> => {
  const project = db.getProjects().find(p => p.id === Number(id));
  if (!project) throw new Error("Project not found");
  return project;
};

export const updateProjectStatus = async (id: number, statusTitle: string) => {
  const project = db.updateProject(id, { status_title: statusTitle });
  if (!project) throw new Error("Project not found");
  return project;
};

export const createProject = async (project: Omit<Project, "id">) => {
  return db.createProject(project);
};

export const createProjectWithTeam = async (
  project: {
    name: string;
    description: string;
    teamId: number;
    status?: string;
    priority?: string;
  },
  _token: string
) => {
  return db.createProject({
    ...project,
    status_title: project.status || 'To Do',
    owner_id: 1, // Default owner for mock
    team_id: project.teamId,
  } as any);
};
