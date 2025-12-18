// src/app/api/teams/[id]/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// -------------------
// GET /api/teams/:id/members - Get all members of a team
// -------------------
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { TeamMember, User } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const teamId = parseInt(resolvedParams.id);
    const rows = await TeamMember.findAll({
      where: { team_id: teamId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    const members = rows.map((r: any) => (r.user ? r.user : null)).filter(Boolean);
    return NextResponse.json({ members });
  } catch (err) {
    console.error('Get team members error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------
// PATCH /api/teams/:id/members - Update roles or active status
// -------------------
const updateMembersSchema = z.object({
  members: z.array(
    z.object({
      userId: z.number(),
      role: z.enum(['owner', 'admin', 'member', 'viewer']),
      isActive: z.boolean(),
    })
  ),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { TeamMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as { role: string };

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update members' }, { status: 403 });
    }

    const teamId = parseInt(resolvedParams.id);
    const body = await req.json();
    const parsed = updateMembersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
    }

    for (const member of parsed.data.members) {
      await TeamMember.update(
        { role: member.role, is_active: member.isActive },
        { where: { team_id: teamId, user_id: member.userId } }
      );
    }

    return NextResponse.json({ message: 'Team members updated successfully' });
  } catch (err) {
    console.error('Update team members error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------
// PUT /api/teams/:id/members - Replace all team members
// -------------------
const replaceMembersSchema = z.object({
  userIds: z.array(z.number()),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { Team, TeamMember, User } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update team members' }, { status: 403 });
    }

    const teamId = parseInt(resolvedParams.id);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    // Check if team exists
    const team = await Team.findByPk(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = replaceMembersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { userIds } = parsed.data;

    // Validate that all user IDs exist
    if (userIds.length > 0) {
      const existingUsers = await User.findAll({
        where: { id: userIds },
        attributes: ['id'],
      });
      
      const existingUserIds = existingUsers.map(user => user.id);
      const invalidUserIds = userIds.filter(id => !existingUserIds.includes(id));
      
      if (invalidUserIds.length > 0) {
        return NextResponse.json(
          { error: `Invalid user IDs: ${invalidUserIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Remove all existing team members
    await TeamMember.destroy({
      where: { team_id: teamId },
    });

    // Add new team members
    if (userIds.length > 0) {
      const teamMemberData = userIds.map(userId => ({
        team_id: teamId,
        user_id: userId,
        role: 'member' as 'member',
        is_active: true,
      }));

      await TeamMember.bulkCreate(teamMemberData);
    }

    return NextResponse.json(
      { message: 'Team members updated successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Update team members error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------
// DELETE /api/teams/:id/members - Remove a member
// -------------------
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { TeamMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult as { role: string };

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 });
    }

    const teamId = parseInt(resolvedParams.id);
    const body = await req.json();
    const { userId } = body;

    await TeamMember.destroy({
      where: { team_id: teamId, user_id: userId },
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Remove team member error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
