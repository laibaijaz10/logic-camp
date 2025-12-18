import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getModels } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";

// ---------------------
// GET /api/projects/:id - Get project by ID with team members
// ---------------------
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { Project, User, Team, TeamMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id, 10);
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Fetch project with team members included
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: Team,
          as: 'team',
          include: [
            {
              model: User,
              as: 'members',
              through: {
                attributes: ['role', 'joined_at', 'is_active'],
                where: { is_active: true }
              },
              attributes: ['id', 'name', 'email', 'role']
            }
          ]
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Transform the data to include members at project level for easier access
    const projectData = project.toJSON() as any;
    const transformedProject = {
      ...projectData,
      members: (projectData.team?.members || []) as Array<{ 
        id: number;
        name: string;
        email: string;
        role: string;
        TeamMember: {
          role: string;
          joinedAt: Date;
          isActive: boolean;
        };
      }>
    };

    return NextResponse.json({ project: transformedProject }, { status: 200 });
  } catch (err: any) {
    console.error("Get project error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch project" }, { status: 500 });
  }
}

// ---------------------
// Validation schema
// ---------------------
const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  statusTitle: z.string().optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid startDate format" }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid endDate format" }),
  teamId: z.number().optional(),
  customStatuses: z
    .array(z.object({
      id: z.number(),
      title: z.string(),
      description: z.string().optional(),
      color: z.string()
    }))
    .optional(),
});

// ---------------------
// PATCH /api/projects/:id
// ---------------------
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { Project, User, Team } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;

    // Allow admins and team leads to update projects
    if (payload.role !== "admin" && payload.role !== "team_lead") {
      return NextResponse.json({ error: "Only admins or team leads can update projects" }, { status: 403 });
    }

    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id, 10);
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    console.log('Project update request body:', body);
    const parsedData = updateProjectSchema.parse(body);

    const validatedData: any = { ...parsedData };

    // Convert date strings to JS Date objects
    if (validatedData.startDate) validatedData.start_date = new Date(validatedData.startDate);
    if (validatedData.endDate) validatedData.end_date = new Date(validatedData.endDate);
    if (validatedData.statusTitle) validatedData.status_title = validatedData.statusTitle;
    if (validatedData.customStatuses) validatedData.statuses = validatedData.customStatuses;

    console.log('Validated data for update:', validatedData);
    await project.update(validatedData);
    console.log('Project updated successfully');

    const updatedProject = await Project.findByPk(projectId, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name'],
          include: [
            {
              model: User,
              as: 'members',
              through: { attributes: ['role', 'joined_at', 'is_active'] },
              attributes: ['id', 'name', 'email', 'role']
            }
          ]
        }
      ],
    });

    return NextResponse.json({ message: "Project updated successfully", project: updatedProject });
  } catch (err: any) {
    console.error("Update project error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// ---------------------
// DELETE /api/projects/:id
// ---------------------
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { Project } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult;

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete projects" }, { status: 403 });
    }

    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id, 10);
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await project.destroy(); // Ensure cascade is configured in Sequelize models
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (err: any) {
    console.error("Delete project error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
