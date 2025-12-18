import { NextRequest, NextResponse } from 'next/server';
import { getDefaultStatuses } from '@/services/statusService';

// GET /api/statuses?entity_type=project|task
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = (searchParams.get('entity_type') || 'project') as 'project' | 'task';

    // Unified defaults for all entity types
    const defaults = [
      { id: 1, title: 'todo', description: 'Item is pending', color: '#6B7280', isDeletable: true },
      { id: 2, title: 'inProgress', description: 'Item is in progress', color: '#3B82F6', isDeletable: true },
      { id: 3, title: 'testing', description: 'Item is being tested', color: '#F59E0B', isDeletable: false },
      { id: 4, title: 'done', description: 'Item is completed', color: '#10B981', isDeletable: false }
    ].map(s => ({ ...s, entity_type: entityType }));

    return NextResponse.json(defaults, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load statuses' }, { status: 500 });
  }
}

// POST /api/statuses
// Body: { title, description?, color, entity_type }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { title, description = '', color = '#3B82F6', entity_type } = body as {
      title: string;
      description?: string;
      color?: string;
      entity_type: 'project' | 'task';
    };

    if (!title || !entity_type) {
      return NextResponse.json({ error: 'title and entity_type are required' }, { status: 400 });
    }

    // Mock an ID; in real implementation, insert into DB and return created item.
    const created = {
      id: Math.floor(Math.random() * 1_000_000),
      title,
      description,
      color,
      entity_type,
    };

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create status' }, { status: 500 });
  }
}


