import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getModels } from "@/lib/db";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    console.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const { User } = await getModels();
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Treat plain user object as loosely typed for this handler
    const userData = user.get({ plain: true }) as any;

    if (!userData.is_approved) {
      return NextResponse.json(
        { message: "Your account is pending approval by admin." },
        { status: 403 }
      );
    }

    const passwordHash = userData.password as string | undefined;
    if (!passwordHash) {
      console.error('User record missing password hash for email:', email);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      console.log(`Password mismatch for email: ${email}`);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = await new SignJWT({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(JWT_SECRET));

    const { password: _, ...userSafe } = userData;

    const response = NextResponse.json({ message: "Login successful", user: userSafe, token });
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
