// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
  description: z.string().nullable().optional(),
  statusTitle: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  expectedTime: z.number().min(0, 'Expected time must be non-negative').optional(),
  spentTime: z.number().min(0, 'Spent time must be non-negative').optional(),
  assignedToId: z.number().nullable().optional(),
  projectId: z.number().min(1, 'Project ID is required'),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.number().min(1, 'Task ID is required'),
});

// --------------------
// GET /api/tasks - Get all tasks for authenticated user, optionally filtered by projectId
// --------------------
export async function GET(req: NextRequest) {
  try {
    const { Task, User, Project } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    // Get projectId from query parameters
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    // Build where clause
    const whereClause: any = {};
    if (projectId) {
      const projectIdNum = parseInt(projectId, 10);
      if (isNaN(projectIdNum)) {
        return NextResponse.json({ error: 'Invalid projectId parameter' }, { status: 400 });
      }
      whereClause.project_id = projectIdNum;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// POST /api/tasks - Create a new task
// --------------------
export async function POST(req: NextRequest) {
  try {
    const { Task, User, Project } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    const body = await req.json();
    const validatedData = createTaskSchema.parse(body);

    // Verify project exists
    const project = await Project.findByPk(validatedData.projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Set default status if not provided
    const finalStatusTitle = validatedData.statusTitle || 'todo';
    
    // Default statuses for new tasks (unified set)
    const defaultStatuses = [
      { id: 1, title: 'todo', description: 'Item is pending', color: '#6B7280', isDeletable: true },
      { id: 2, title: 'inProgress', description: 'Item is in progress', color: '#3B82F6', isDeletable: true },
      { id: 3, title: 'testing', description: 'Item is being tested', color: '#F59E0B', isDeletable: false },
      { id: 4, title: 'done', description: 'Item is completed', color: '#10B981', isDeletable: false }
    ];

    // Enforce: task deadline within project date range (if dates present)
    if (validatedData.dueDate) {
      const due = new Date(validatedData.dueDate);
      if (project.start_date && due < new Date(project.start_date)) {
        return NextResponse.json({ error: 'Task deadline is before project start_date' }, { status: 422 });
      }
      if (project.end_date && due > new Date(project.end_date)) {
        return NextResponse.json({ error: 'Task deadline is after project end_date' }, { status: 422 });
      }
    }

    // Verify assignee exists if provided
    const assigneeId = validatedData.assignedToId ?? null;
    if (assigneeId) {
      const assignee = await User.findByPk(assigneeId, { attributes: ['id'] });
      if (!assignee) {
        return NextResponse.json({ error: 'Assigned user not found' }, { status: 400 });
      }
    }

      const task = await Task.create({
        title: validatedData.title,
        description: validatedData.description ?? undefined,
        statuses: defaultStatuses,
        status_title: finalStatusTitle,
        deadline: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        expected_time: validatedData.expectedTime ?? 0,
        spent_time: validatedData.spentTime ?? 0,
        project_id: validatedData.projectId,
        assigned_to_id: assigneeId ?? undefined,
    });

    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
      ],
    });

    return NextResponse.json(
      { message: 'Task created successfully', task: createdTask },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// PATCH /api/tasks - Update a task
// --------------------
export async function PATCH(req: NextRequest) {
  try {
    const { Task, User, Project } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    const body = await req.json();
    const validatedData = updateTaskSchema.parse(body);

    const task = await Task.findByPk(validatedData.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify assignee exists if provided
    let newAssignedId: number | null | undefined = undefined;
    if (validatedData.assignedToId !== undefined) {
      if (validatedData.assignedToId === null) {
        newAssignedId = null;
      } else {
        const assignee = await User.findByPk(validatedData.assignedToId, { attributes: ['id'] });
        if (!assignee) {
          return NextResponse.json({ error: 'Assigned user not found' }, { status: 400 });
        }
        newAssignedId = validatedData.assignedToId;
      }
    }

    // No need to verify status since we're using JSON statuses

    // Update task
    await task.update({
      title: validatedData.title ?? task.title,
      description: validatedData.description ?? task.description,
      status_title: validatedData.statusTitle ?? task.status_title,
      deadline: validatedData.dueDate ? new Date(validatedData.dueDate) : task.deadline,
      expected_time: validatedData.expectedTime ?? task.expected_time,
      spent_time: validatedData.spentTime ?? task.spent_time,
      assigned_to_id: newAssignedId === undefined ? task.assigned_to_id : (newAssignedId ?? undefined),
      project_id: validatedData.projectId ?? task.project_id,
    });

    // No multi-assignee support in schema; nothing else to update

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
      ],
    });

    return NextResponse.json(
      { message: 'Task updated successfully', task: updatedTask },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update task error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --------------------
// DELETE /api/tasks - Delete a task
// --------------------
export async function DELETE(req: NextRequest) {
  try {
    const { Task } = await getModels();

    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('id');

    if (!taskId || isNaN(parseInt(taskId))) {
      return NextResponse.json({ error: 'Valid task ID is required' }, { status: 400 });
    }

    const task = await Task.findByPk(parseInt(taskId));
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await task.destroy();

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
