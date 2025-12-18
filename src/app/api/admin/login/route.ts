import { NextRequest, NextResponse } from "next/server";
import { getModels, ensureDbInitialized } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import sequelize from "@/lib/database";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log("Admin login attempt for email:", email);

    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    
    // Test direct database connection first
    try {
      console.log("Testing direct database connection...");
      await sequelize.authenticate();
      console.log("Direct database connection successful");
    } catch (dbError: any) {
      console.error("Direct database connection failed:", dbError.message);
      return NextResponse.json({ error: "Database connection failed", message: dbError.message }, { status: 500 });
    }
    
    console.log("Ensuring database is initialized...");
    await ensureDbInitialized();
    console.log("Database initialized, getting models...");
    const { User } = await getModels();
    console.log("Models retrieved successfully");

    console.log("Searching for admin with email:", email);
    const admin = await User.findOne({ 
      where: { email, role: "admin" },
      logging: console.log
    });
    
    if (!admin) {
      console.log("Admin not found for email:", email);
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    console.log("Admin found:", admin.id);

    const passwordHash = admin.getDataValue("password") as string | undefined;
    if (!passwordHash) {
      console.error("Admin record missing password hash for email:", email);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      console.log("Invalid password for admin email:", email);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const adminData = admin.toJSON();

    const token = await new SignJWT({
      userId: adminData.id,
      email: adminData.email,
      role: adminData.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(JWT_SECRET));

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      admin: { id: adminData.id, name: adminData.name, email: adminData.email, role: adminData.role },
      token: token
    }, { status: 200 });

    console.log("Admin login successful for email:", email);

    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60,
      path: '/'
    });

    return response;

    
  } catch (error: any) {
    console.error("Login error:", error.message);
    console.error("Login error stack:", error.stack);
    return NextResponse.json({ error: "Login failed", message: error.message }, { status: 500 });
  }
}
