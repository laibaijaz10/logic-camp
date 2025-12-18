import { User, Project, Task, Team, TeamMember } from '../models';
import bcrypt from 'bcryptjs';
import { initializeDatabase } from './init-db';

function getDefaultStatuses() {
  return [
    {
      id: 1,
      title: 'todo',
      description: 'Task/Project is pending',
      color: '#6B7280',
    },
    {
      id: 2,
      title: 'inProgress',
      description: 'Task/Project is in progress',
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'testing',
      description: 'Task/Project is being tested',
      color: '#F59E0B',
    },
    {
      id: 4,
      title: 'review',
      description: 'Task/Project is under review',
      color: '#8B5CF6',
    },
    {
      id: 5,
      title: 'done',
      description: 'Task/Project is completed',
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

    // Clear existing users before seeding new ones
    await User.destroy({ where: {}, truncate: true, cascade: true });

    // Create new admin user (for admin dashboard)
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const admin = await User.create({
      name: 'Dashboard Admin',
      email: 'admin@logiccamp.com',
      password: adminPassword,
      role: 'admin',
      is_active: true,
      is_approved: true,
    });

    // Create new regular user (for user dashboard)
    const userPassword = await bcrypt.hash('User@123', 12);
    const user = await User.create({
      name: 'Dashboard User',
      email: 'user@logiccamp.com',
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

    // Create tasks directly for the project
    await Task.create({
      title: 'Set up database schema',
      description: 'Create all necessary database tables and relationships',
      statuses: statuses,
      status_title: 'done',
      project_id: project.id,
      assigned_to_id: admin.id,
      expected_time: 240, // 4 hours in minutes
      spent_time: 210, // 3.5 hours in minutes
    });

    await Task.create({
      title: 'Implement authentication',
      description: 'Set up JWT-based authentication system',
      statuses: statuses,
      status_title: 'inProgress',
      project_id: project.id,
      assigned_to_id: user.id,
      expected_time: 360, // 6 hours in minutes
      spent_time: 0,
    });

    await Task.create({
      title: 'Create project management features',
      description: 'Implement CRUD operations for projects',
      statuses: statuses,
      status_title: 'todo',
      project_id: project.id,
      assigned_to_id: user.id,
      expected_time: 480, // 8 hours in minutes
      spent_time: 0,
    });

    console.log('Database seeded successfully!');
    console.log('Admin user (for admin dashboard): admin@logiccamp.com / Admin@123');
    console.log('Regular user (for user dashboard): user@logiccamp.com / User@123');
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
