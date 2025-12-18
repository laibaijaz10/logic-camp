// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// ------------------
// Helper: Verify Admin
// ------------------
async function verifyAdmin(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (authResult.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return authResult.user;
}

// ------------------
// PUT Handler
// ------------------
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // 1. Verify admin
  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  // 2. Get request body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, role, password, isApproved, isActive } = body;

  if (!name && !email && !role && !password && isApproved === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const { User } = await getModels();
    const user = await User.findByPk(id); // Sequelize

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (role !== undefined) {
      const normalizedRole = role === 'teamLead' ? 'team_lead' : role;
      const allowed = ['admin', 'team_lead', 'employee'];
      if (!allowed.includes(normalizedRole)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      user.set('role', normalizedRole);
    }
    if (isApproved !== undefined) user.set('is_approved', !!isApproved);
    if (isActive !== undefined) user.set('is_active', !!isActive);

    await user.save();

    return NextResponse.json({ message: "User updated", user });
  } catch (err: any) {
    console.error(err);
    const message = err?.message || 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ------------------
// DELETE Handler
// ------------------
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // 1. Verify admin
  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    const { User } = await getModels();
    const deletedRows = await User.destroy({ where: { id } });

    if (deletedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /admin/users/[id] error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
