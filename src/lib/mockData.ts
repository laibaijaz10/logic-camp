import { Project, Task, User, StatusItem, Status, Team } from '@/types';
import { NotificationData, NotificationType } from '@/types/notifications';

// Initial Statuses
export const mockStatuses: StatusItem[] = [
    { id: 1, title: 'To Do', description: 'Item is pending', color: '#6B7280', isDeletable: false },
    { id: 2, title: 'In Progress', description: 'Item is in progress', color: '#3B82F6', isDeletable: false },
    { id: 3, title: 'Testing', description: 'Item is being tested', color: '#F59E0B', isDeletable: false },
    { id: 4, title: 'Done', description: 'Item is completed', color: '#10B981', isDeletable: false },
];

// Mock Users (15 users)
export const mockUsers: User[] = [
    // Demo admin and demo user accounts for login screens
    { id: 1, name: 'Admin User', email: 'admin@logicamp.com', role: 'admin', isActive: true },
    { id: 2, name: 'Demo User', email: 'user@logicamp.com', role: 'employee', isActive: true },
    { id: 3, name: 'Olivia Smith', email: 'olivia@logiccamp.com', role: 'employee', isActive: true },
    { id: 4, name: 'Noah Davis', email: 'noah@logiccamp.com', role: 'employee', isActive: true },
    { id: 5, name: 'Ava Brown', email: 'ava@logiccamp.com', role: 'teamLead', isActive: true },
    { id: 6, name: 'William Garcia', email: 'william@logiccamp.com', role: 'employee', isActive: true },
    { id: 7, name: 'Sophia Miller', email: 'sophia@logiccamp.com', role: 'employee', isActive: true },
    { id: 8, name: 'James Wilson', email: 'james@logiccamp.com', role: 'teamLead', isActive: true },
    { id: 9, name: 'Isabella Taylor', email: 'isabella@logiccamp.com', role: 'employee', isActive: true },
    { id: 10, name: 'Benjamin Anderson', email: 'ben@logiccamp.com', role: 'employee', isActive: true },
    { id: 11, name: 'Mia Thomas', email: 'mia@logiccamp.com', role: 'employee', isActive: true },
    { id: 12, name: 'Lucas Moore', email: 'lucas@logiccamp.com', role: 'employee', isActive: true },
    { id: 13, name: 'Charlotte Jackson', email: 'charlotte@logiccamp.com', role: 'employee', isActive: true },
    { id: 14, name: 'Alexander White', email: 'alex@logiccamp.com', role: 'employee', isActive: true },
    { id: 15, name: 'Amelia Harris', email: 'amelia@logiccamp.com', role: 'employee', isActive: true },
];

// Mock Teams (6 teams)
export const mockTeams: Team[] = [
    { id: 1, name: 'Frontend Squad', description: 'UI/UX and Frontend development', isActive: true, members: [mockUsers[0], mockUsers[2], mockUsers[3], mockUsers[4]].map(u => ({ ...u, joinedAt: new Date(), role: 'member' })) },
    { id: 2, name: 'Backend Masters', description: 'API and Database management', isActive: true, members: [mockUsers[1], mockUsers[5], mockUsers[6]].map(u => ({ ...u, joinedAt: new Date(), role: 'member' })) },
    { id: 3, name: 'Mobile Experts', description: 'iOS and Android development', isActive: true, members: [mockUsers[7], mockUsers[8], mockUsers[9]].map(u => ({ ...u, joinedAt: new Date(), role: 'member' })) },
    { id: 4, name: 'QA Ninjas', description: 'Quality assurance and testing', isActive: true, members: [mockUsers[10], mockUsers[11]].map(u => ({ ...u, joinedAt: new Date(), role: 'member' })) },
    { id: 5, name: 'DevOps Heroes', description: 'Cloud infrastructure and CI/CD', isActive: true, members: [mockUsers[12], mockUsers[13]].map(u => ({ ...u, joinedAt: new Date(), role: 'member' })) },
    { id: 6, name: 'Product Growth', description: 'Product management and marketing', isActive: true, members: [mockUsers[14], mockUsers[0]].map(u => ({ ...u, joinedAt: new Date(), role: 'member' })) },
];

// Mock Projects (6 projects)
export const mockProjects: Project[] = [
    { id: 1, name: 'Logic Camp Website', description: 'The main company landing page and blog.', status_title: 'In Progress', team_id: 1, owner_id: 2, createdAt: new Date(), team: mockTeams[0] },
    { id: 2, name: 'Task Manager Pro', description: 'Internal productivity tool.', status_title: 'To Do', team_id: 2, owner_id: 5, createdAt: new Date(), team: mockTeams[1] },
    { id: 3, name: 'Fitness Tracker App', description: 'Cross-platform mobile application.', status_title: 'Testing', team_id: 3, owner_id: 8, createdAt: new Date(), team: mockTeams[2] },
    { id: 4, name: 'API Gateway Refactor', description: 'Modernizing the legacy backend.', status_title: 'In Progress', team_id: 2, owner_id: 1, createdAt: new Date(), team: mockTeams[1] },
    { id: 5, name: 'Client Dashboard', description: 'Customer portal for analytics.', status_title: 'Done', team_id: 1, owner_id: 2, createdAt: new Date(), team: mockTeams[0] },
    { id: 6, name: 'Internal HR System', description: 'Employee management software.', status_title: 'To Do', team_id: 6, owner_id: 1, createdAt: new Date(), team: mockTeams[5] },
];

// Generating Tasks (7-8 per project)
const generateTasks = () => {
    const tasks: Task[] = [];
    const taskTitles = [
        ['Design Navbar', 'Hero Section', 'Contact Form', 'About Page', 'Fix Footer', 'Mobile Menu', 'SEO Tags', 'Image Optimization'],
        ['Database Schema', 'Auth Middleware', 'User Registration', 'Password Reset', 'Task Creation API', 'File Uploads', 'Testing Endpoints', 'API Documentation'],
        ['Login Screen', 'Dashboard Layout', 'Step Counter', 'Heart Rate Chart', 'Profile Settings', 'Map Integration', 'Push Notifications', 'Offline Mode'],
        ['Gateway Setup', 'Rate Limiting', 'Logging System', 'Header Forwarding', 'Error Handling', 'Unit Tests', 'Documentation', 'Deployment Script'],
        ['Login Page UI', 'Analytics Chart', 'CSV Export', 'User Permissions', 'API Integration', 'Form Validation', 'Real-time Stats', 'Theme Switcher'],
        ['Employee List', 'Leave Requests', 'Payroll Logic', 'Hiring Pipeline', 'Org Chart', 'Policy Manual', 'Onboarding Flow', 'Direct Deposit'],
    ];

    const statuses = ['To Do', 'In Progress', 'Testing', 'Done'];

    for (let p = 0; p < 6; p++) { // 6 projects
        const numTasks = 7 + Math.floor(Math.random() * 2); // 7 or 8 tasks
        for (let t = 0; t < numTasks; t++) {
            const taskId = p * 10 + t + 1;
            const statusIdx = Math.floor(Math.random() * statuses.length);
            const userIdx = Math.floor(Math.random() * mockUsers.length);

            tasks.push({
                id: taskId,
                title: taskTitles[p][t] || `Task ${t + 1} for Project ${p + 1}`,
                description: `Detailed description for ${taskTitles[p][t] || `task ${t + 1}`}`,
                status_title: statuses[statusIdx],
                expected_time: 60 * (1 + Math.floor(Math.random() * 8)),
                spent_time: 60 * Math.floor(Math.random() * 5),
                project_id: p + 1,
                assigned_to_id: mockUsers[userIdx].id,
                assignedTo: mockUsers[userIdx],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }
    return tasks;
};

// Global state for mock data to simulate "database"
class MockDatabase {
    users = [...mockUsers];
    teams = [...mockTeams];
    projects = [...mockProjects];
    tasks = generateTasks();
    statuses = [...mockStatuses];
    notifications: NotificationData[] = [];

    // Tasks
    getTasks() { return this.tasks; }
    getTasksByProject(projectId: number) {
        return this.tasks.filter(t => t.project_id === Number(projectId));
    }
    createTask(task: Omit<Task, 'id'>) {
        const newTask = {
            ...task,
            id: Math.max(0, ...this.tasks.map(t => t.id)) + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            expected_time: task.expected_time || 0,
            spent_time: task.spent_time || 0,
        } as Task;
        this.tasks.push(newTask);
        return newTask;
    }
    updateTask(id: number, updates: Partial<Task>) {
        const index = this.tasks.findIndex(t => t.id === Number(id));
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...updates, updatedAt: new Date() };
            return this.tasks[index];
        }
        return null;
    }
    deleteTask(id: number) {
        this.tasks = this.tasks.filter(t => t.id !== Number(id));
    }

    // Projects
    getProjects() { return this.projects; }
    getTeams() { return this.teams; }
    createProject(project: Omit<Project, 'id'>) {
        const newProject = { ...project, id: Math.max(0, ...this.projects.map(p => p.id)) + 1, createdAt: new Date(), updatedAt: new Date() } as Project;
        this.projects.push(newProject);
        return newProject;
    }
    updateProject(id: number, updates: Partial<Project>) {
        const index = this.projects.findIndex(p => p.id === Number(id));
        if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...updates, updatedAt: new Date() };
            return this.projects[index];
        }
        return null;
    }

    // Users
    getUsers() { return this.users; }
    getCurrentUser() { return this.users[0]; } // Mock Emma Wilson as admin
}

export const db = new MockDatabase();
