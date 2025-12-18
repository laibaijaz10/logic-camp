import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth';
import { getModels } from '../../../../../lib/db';
import { logActivity } from '../../../../../middleware/activityLogger';

interface RouteParams {
  params: Promise<{
    id: string;
    action: string;
  }>;
}

// PUT /api/users/[id]/[action] - Perform user actions
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { User } = await getModels();

    // Check permissions using already verified user role
    const requesterRole = authResult.user.role;
    if (requesterRole !== 'admin' && requesterRole !== 'teamLead') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(resolvedParams.id);
    const action = resolvedParams.action;

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent users from modifying themselves (except admins can deactivate themselves)
    if (userId === authResult.user.userId && action !== 'deactivate') {
      return NextResponse.json({ error: 'Cannot perform this action on yourself' }, { status: 400 });
    }

    // Prevent non-admins from modifying admins
    if (authResult.user.role !== 'admin' && user.role === 'admin') {
      return NextResponse.json({ error: 'Cannot modify admin users' }, { status: 403 });
    }

    let updateData: any = {};
    let activityAction = '';
    let activityMetadata: any = {};

    switch (action) {
      case 'activate':
        if (user.is_active) {
          return NextResponse.json({ error: 'User is already active' }, { status: 400 });
        }
        updateData = { isActive: true };
        activityAction = 'ACTIVATE';
        activityMetadata = { targetUserId: userId, targetUserName: user.name };
        break;

      case 'deactivate':
        if (!user.is_active) {
          return NextResponse.json({ error: 'User is already inactive' }, { status: 400 });
        }
        updateData = { isActive: false };
        activityAction = 'DEACTIVATE';
        activityMetadata = { targetUserId: userId, targetUserName: user.name };
        break;

      case 'approve':
        if (user.is_approved) {
          return NextResponse.json({ error: 'User is already approved' }, { status: 400 });
        }
        updateData = { isApproved: true };
        activityAction = 'APPROVE';
        activityMetadata = { targetUserId: userId, targetUserName: user.name };
        break;

      case 'reject':
        if (!user.is_approved) {
          return NextResponse.json({ error: 'User is already rejected' }, { status: 400 });
        }
        updateData = { isApproved: false, isActive: false };
        activityAction = 'REJECT';
        activityMetadata = { targetUserId: userId, targetUserName: user.name };
        break;

      case 'delete':
        // Only admins can delete users
        if (authResult.user.role !== 'admin') {
          return NextResponse.json({ error: 'Only admins can delete users' }, { status: 403 });
        }
        
        // Cannot delete yourself
        if (userId === authResult.user.userId) {
          return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        // Log activity before deletion
        await logActivity(request, {
          action: 'DELETE',
          resource: 'USER',
          resourceId: userId,
          metadata: { targetUserId: userId, targetUserName: user.name, targetUserEmail: user.email }
        });

        await user.destroy();
        return NextResponse.json({ message: 'User deleted successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update the user
    await user.update(updateData);

    // Log activity
    await logActivity(request, {
      action: activityAction,
      resource: 'USER',
      resourceId: userId,
      metadata: activityMetadata
    });

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return NextResponse.json({ 
      message: `User ${action}d successfully`,
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error(`Error ${resolvedParams.action}ing user:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}