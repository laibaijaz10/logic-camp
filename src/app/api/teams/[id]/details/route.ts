import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// -------------------
// GET /api/teams/:id/details - Get team details with associated projects
// -------------------
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { Team, Project, User } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const teamId = parseInt(resolvedParams.id);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    // Fetch team with members
    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'role'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'teamLead',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get associated projects (Project.team_id column)
    const projects = await Project.findAll({
      where: { team_id: teamId },
      attributes: ['id', 'name', 'description', 'status', 'priority'],
      order: [['updatedAt', 'DESC']]
    });

    return NextResponse.json({ 
      team,
      projects,
      projectCount: projects.length
    }, { status: 200 });
  } catch (err) {
    console.error('Fetch team details error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}