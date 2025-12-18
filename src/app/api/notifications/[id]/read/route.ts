import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/notifications/[id]/read - Placeholder, notifications model not implemented
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const notificationId = parseInt(resolvedParams.id);

  if (isNaN(notificationId)) {
    return NextResponse.json(
      { error: 'Invalid notification ID' },
      { status: 400 }
    );
  }

  // Notifications persistence is not implemented; respond as a no-op
  return NextResponse.json({
    message: 'Notification marked as read (no-op, notifications not implemented)',
    id: notificationId,
  });
}

// DELETE /api/notifications/[id]/read - Placeholder, notifications model not implemented
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const notificationId = parseInt(resolvedParams.id);

  if (isNaN(notificationId)) {
    return NextResponse.json(
      { error: 'Invalid notification ID' },
      { status: 400 }
    );
  }

  // Notifications persistence is not implemented; respond as a no-op
  return NextResponse.json({
    message: 'Notification marked as unread (no-op, notifications not implemented)',
    id: notificationId,
  });
}