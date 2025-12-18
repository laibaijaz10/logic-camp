"use client";

import { useState, useEffect, useCallback } from "react";

// -----------------
// Types
// -----------------
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee" | "teamLead";
  isApproved: boolean;
}

export interface Team {
  id: number;
  name: string;
  members: User[];
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  progress?: number;
  updatedAt: string;
  statuses?: Array<{ id: number; title: string; description?: string; color: string }>;
  status_title?: string;
  start_date?: string;
  end_date?: string;
  team_id?: number | null;
  owner_id?: number;
  members?: User[];
  team?: {
    id: number;
    name: string;
    members: User[];
  };
}

export interface TaskAssignee {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completed: boolean;
  assignedTo?: TaskAssignee;
  assignees?: TaskAssignee[];
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
}

import { db } from "@/lib/mockData";

// -----------------
// Hook
// -----------------
export default function useAdminData(isAuthenticated: boolean = false) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsPerPage] = useState(6);
  const [projectsSearch, setProjectsSearch] = useState("");
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalProjectsPages, setTotalProjectsPages] = useState(0);

  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamsPage, setTeamsPage] = useState(1);
  const [teamsPerPage] = useState(9);
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalTeamsPages, setTotalTeamsPages] = useState(0);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [effectiveAuthenticated, setEffectiveAuthenticated] = useState<boolean>(true);

  // Load Users
  useEffect(() => {
    setLoadingUsers(true);
    const mockUsers = db.getUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as any,
      isApproved: true
    }));
    setUsers(mockUsers);
    setLoadingUsers(false);
  }, []);

  // Load Projects
  const fetchProjects = useCallback(async (page: number = 1, search: string = "") => {
    setLoadingProjects(true);
    let all = db.getProjects() as any[];
    if (search) {
      all = all.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    const start = (page - 1) * projectsPerPage;
    const paginated = all.slice(start, start + projectsPerPage);

    setProjects(paginated.map(p => ({
      ...p,
      updatedAt: p.updatedAt?.toISOString() || new Date().toISOString()
    })));
    setTotalProjects(all.length);
    setTotalProjectsPages(Math.ceil(all.length / projectsPerPage));
    setProjectsPage(page);
    setLoadingProjects(false);
  }, [projectsPerPage]);

  useEffect(() => {
    fetchProjects(1, projectsSearch);
  }, [fetchProjects, projectsSearch]);

  // Load Teams
  const fetchTeams = useCallback(async (page: number = 1) => {
    setLoadingTeams(true);
    const all = db.getTeams();
    const start = (page - 1) * teamsPerPage;
    const paginated = all.slice(start, start + teamsPerPage);

    setTeams(paginated.map(t => ({
      id: t.id,
      name: t.name,
      members: [] // Simplified for mock
    })));
    setTotalTeams(all.length);
    setTotalTeamsPages(Math.ceil(all.length / teamsPerPage));
    setTeamsPage(page);
    setLoadingTeams(false);
  }, [teamsPerPage]);

  useEffect(() => {
    fetchTeams(1);
  }, [fetchTeams]);

  // Load Tasks
  useEffect(() => {
    setLoadingTasks(true);
    const mockTasks = db.getTasks().map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      status: String(t.status_title).toLowerCase(),
      completed: t.status_title === 'Done',
      projectId: t.project_id // Direct project relation
    }));
    setTasks(mockTasks as any);
    setLoadingTasks(false);
  }, []);

  // Actions
  const approveUser = useCallback(async (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isApproved: true } : u));
  }, []);

  const rejectUser = useCallback(async (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isApproved: false } : u));
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const editUser = useCallback(async (id: number, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const createTeam = useCallback(async (team: any) => {
    const newTeam = { id: Date.now(), ...team, members: [] };

    // 1) Update the mock database
    db.teams.unshift(newTeam as any);

    // 2) Optimistically update frontend state so the new team is visible immediately on page 1
    setTeams(prev => {
      const updated = [
        { id: newTeam.id, name: newTeam.name, members: [] },
        ...prev,
      ];
      return updated.slice(0, teamsPerPage);
    });
    setTotalTeams(prev => prev + 1);
    setTeamsPage(1);

    // 3) Also refetch from page 1 to stay in sync with any other logic
    fetchTeams(1);

    return newTeam;
  }, [fetchTeams, teamsPerPage]);

  const addTaskToProject = useCallback(async (projectId: number, task: any) => {
    const newTask = db.createTask({ ...task, project_id: projectId });
    return newTask;
  }, []);

  const createProject = useCallback(async (project: any) => {
    db.createProject({ ...project, owner_id: 1 });
    fetchProjects(1, projectsSearch);
  }, [fetchProjects, projectsSearch]);

  const editProject = useCallback(async (id: number, updates: any) => {
    db.updateProject(id, updates);
    fetchProjects(projectsPage, projectsSearch);
  }, [fetchProjects, projectsPage, projectsSearch]);

  const deleteProject = useCallback(async (id: number) => {
    db.projects = db.projects.filter(p => p.id !== id);
    fetchProjects(1, projectsSearch);
  }, [fetchProjects, projectsSearch]);

  const deleteTeam = useCallback(async (id: number) => {
    db.teams = db.teams.filter(t => t.id !== id);
    fetchTeams(1);
  }, [fetchTeams]);

  const deleteTeamCascade = useCallback(async (id: number) => {
    db.teams = db.teams.filter(t => t.id !== id);
    fetchTeams(1);
  }, [fetchTeams]);

  const openProject = useCallback((projectId: number) => {
    window.location.href = `/admin/projects/${projectId}`;
  }, []);

  return {
    users, loadingUsers, approveUser, rejectUser, deleteUser, editUser,
    projects, loadingProjects, projectsPage, projectsPerPage, projectsSearch, totalProjects, totalProjectsPages, setProjectsSearch, fetchProjects,
    teams, loadingTeams, teamsPage, teamsPerPage, totalTeams, totalTeamsPages, fetchTeams,
    tasks, loadingTasks,
    openProject, createProject, createTeam, editProject, deleteProject, addTaskToProject,
    deleteTeam, deleteTeamCascade,
  };
}
