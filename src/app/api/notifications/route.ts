import { NextRequest, NextResponse } from 'next/server';

// POST /api/notifications - Placeholder, notifications model not implemented
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type, relatedEntityType, relatedEntityId } = body;

    // Basic validation of required fields
    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, message, type' },
        { status: 400 }
      );
    }

    // Just echo back a fake notification object without touching the DB
    const notification = {
      id: Date.now(),
      user_id: userId,
      title,
      message,
      type,
      related_type: relatedEntityType,
      related_id: relatedEntityId,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error handling notification POST (placeholder):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/notifications - Placeholder, returns empty list
export async function GET(request: NextRequest) {
  try {
    // Accept query params but ignore them for now
    // const { searchParams } = new URL(request.url);
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error handling notification GET (placeholder):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}