import { User, Project, Task, Team, TeamMember, Goal } from '../models';
import bcrypt from 'bcryptjs';
import { initializeDatabase } from './init-db';

function getDefaultStatuses() {
  return [
    {
      id: 1,
      title: 'todo',
      description: 'Task/Project/Goal is pending',
      color: '#6B7280',
    },
    {
      id: 2,
      title: 'inProgress',
      description: 'Task/Project/Goal is in progress',
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'testing',
      description: 'Task/Project/Goal is being tested',
      color: '#F59E0B',
    },
    {
      id: 4,
      title: 'review',
      description: 'Task/Project/Goal is under review',
      color: '#8B5CF6',
    },
    {
      id: 5,
      title: 'done',
      description: 'Task/Project/Goal is completed',
      color: '#10B981',
    },
  ];
}

export async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Initialize database and models first
    await initializeDatabase();
    console.log('Database initialized, proceeding with seeding...');

    // Get default statuses
    const statuses = getDefaultStatuses();
    console.log('Using default statuses');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@myteamcamp.com',
      password: adminPassword,
      role: 'admin',
      is_active: true,
      is_approved: true,
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await User.create({
      name: 'John Doe',
      email: 'john@myteamcamp.com',
      password: userPassword,
      role: 'employee',
      is_active: true,
      is_approved: true,
    });

    // Create team
    const team = await Team.create({
      name: 'Development Team',
      description: 'Main development team for the project',
      is_active: true,
      team_lead_id: admin.id,
    });

    // Add users to team
    await TeamMember.create({
      user_id: admin.id,
      team_id: team.id,
      role: 'owner',
      is_active: true,
    });

    await TeamMember.create({
      user_id: user.id,
      team_id: team.id,
      role: 'member',
      is_active: true,
    });

    // Create project with statuses
    const project = await Project.create({
      name: 'MyTeamCamp Application',
      description: 'A team management application built with Next.js and PostgreSQL',
      statuses: statuses,
      status_title: 'todo',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31'),
      owner_id: admin.id,
      team_id: team.id,
    });

    // Create a goal for the project
    const goal = await Goal.create({
      title: 'Complete MVP Development',
      description: 'Build the minimum viable product for the team management application',
      statuses: statuses,
      status_title: 'todo',
      project_id: project.id,
      deadline: new Date('2024-06-30'),
    });

    // Create tasks
    await Task.create({
      title: 'Set up database schema',
      description: 'Create all necessary database tables and relationships',
      statuses: statuses,
      status_title: 'done',
      goal_id: goal.id,
      assigned_to_id: admin.id,
      expected_time: 240, // 4 hours in minutes
      spent_time: 210, // 3.5 hours in minutes
    });

    await Task.create({
      title: 'Implement authentication',
      description: 'Set up JWT-based authentication system',
      statuses: statuses,
      status_title: 'inProgress',
      goal_id: goal.id,
      assigned_to_id: user.id,
      expected_time: 360, // 6 hours in minutes
      spent_time: 0,
    });

    await Task.create({
      title: 'Create project management features',
      description: 'Implement CRUD operations for projects',
      statuses: statuses,
      status_title: 'todo',
      goal_id: goal.id,
      assigned_to_id: user.id,
      expected_time: 480, // 8 hours in minutes
      spent_time: 0,
    });

    console.log('Database seeded successfully!');
    console.log('Admin user: admin@myteamcamp.com / admin123');
    console.log('Regular user: john@myteamcamp.com / user123');
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
}

// Auto-run if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
