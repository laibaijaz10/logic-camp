// Shared types for the application

export interface StatusItem {
  id: number;
  title: string;
  description?: string;
  color: string;
  isDeletable?: boolean;
}

export type Status = StatusItem;

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'teamLead';
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  members?: TeamMember[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  isActive?: boolean;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  statuses?: StatusItem[] | null;
  status_title: string;
  start_date?: Date;
  end_date?: Date;
  team_id: number;
  owner_id: number;
  files?: object | null;
  team?: Team;
  members?: TeamMember[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  statuses?: StatusItem[] | null;
  status_title: string;
  deadline?: Date;
  expected_time: number; // in minutes
  spent_time: number; // in minutes
  project_id: number;
  assigned_to_id?: number;
  assignedTo?: User;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskComment {
  id: number;
  content: string;
  task_id: number;
  user_id: number;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  user_id: number;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CreateTaskForm {
  title: string;
  description?: string;
  statusTitle: string;
  assignedToId?: number;
  dueDate?: string;
  expectedTime?: number;
  spentTime?: number;
  projectId: number;
}

export interface UpdateTaskForm extends Partial<CreateTaskForm> {
  id: number;
}

export interface CreateProjectForm {
  name: string;
  description?: string;
  statusTitle?: string;
  startDate?: string;
  endDate?: string;
  teamId: number;
}

export interface UpdateProjectForm extends Partial<CreateProjectForm> {
  id: number;
}

export interface CreateStatusItemForm {
  title: string;
  description?: string;
  color: string;
}

export interface UpdateStatusItemForm extends Partial<CreateStatusItemForm> {
  id: number;
}
