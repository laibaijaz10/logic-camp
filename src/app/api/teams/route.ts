import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Schema for creating a team
const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
});

// -------------------
// GET /api/teams - Get all teams with pagination
// -------------------
export async function GET(req: NextRequest) {
  try {
    const { Team, User } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    // Only admins can view all teams
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can view teams' }, { status: 403 });
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch teams with pagination - only active teams
    // First get the count without includes to avoid counting associated records
    const totalCount = await Team.count({
      where: { is_active: true }
    });

    // Then fetch the teams with includes
    const teams = await Team.findAll({
      where: { is_active: true },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'teamLead', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: [] } },
      ],
    });

    const count = totalCount;


    // Normalize shape for UI
    const normalizedTeams = teams.map((t: any) => (t.get ? t.get({ plain: true }) : t));

    return NextResponse.json({
      teams: normalizedTeams,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    }, { status: 200 });
  } catch (err) {
    console.error('Fetch teams error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------
// POST /api/teams - Create new team
// -------------------
export async function POST(req: NextRequest) {
  try {
    const { Team } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    // Admin or Team Lead can create teams
    if (payload.role !== 'admin' && payload.role !== 'team_lead') {
      return NextResponse.json({ error: 'Only admins or team leads can create teams' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createTeamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ where: { name: parsed.data.name } });
    if (existingTeam) {
      return NextResponse.json(
        { error: 'A team with this name already exists. Please choose a different name.' },
        { status: 409 }
      );
    }

    // Create the team, using the current user as team lead by default
    const team = await Team.create({
      name: parsed.data.name,
      description: parsed.data.description || null,
      is_active: true,
      team_lead_id: (payload as any).userId,
    });

    return NextResponse.json({ team, message: 'Team created successfully' }, { status: 201 });
  } catch (err) {
    console.error('Create team error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}