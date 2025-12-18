import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// -------------------
// DELETE /api/teams/:id/cascade - Delete team with all associated projects
// -------------------
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { Team, Project, TeamMember, Task } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete teams' }, { status: 403 });
    }

    const teamId = parseInt(resolvedParams.id);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    const team = await Team.findByPk(teamId);
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    // Get all associated projects (Project.team_id column)
    const projects = await Project.findAll({ where: { team_id: teamId } });
    const projectIds = projects.map(p => p.id);

    // Start transaction for cascade deletion
    const sequelize = Team.sequelize;
    const transaction = await sequelize!.transaction();

    try {
      // Delete tasks and projects associated with this team
      if (projectIds.length > 0) {
        await Task.destroy({ 
          // Task.project_id column
          where: { project_id: projectIds },
          transaction 
        });

        await Project.destroy({ 
          // Project.team_id column
          where: { team_id: teamId },
          transaction 
        });
      }

      // Delete team members (TeamMember.team_id column)
      await TeamMember.destroy({ 
        where: { team_id: teamId },
        transaction 
      });

      // Delete the team
      await team.destroy({ transaction });

      await transaction.commit();

      return NextResponse.json({ 
        message: 'Team and all associated projects deleted successfully',
        deletedProjects: projects.length
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (err) {
    console.error('Cascade delete team error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}