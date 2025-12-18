import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ valid: false, message: "No token provided" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || "your-super-secret-jwt-key";

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.json({ valid: true, user: payload });
    } catch (err) {
      return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ valid: false, message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "your-super-secret-jwt-key";

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.json({ valid: true, user: payload });
    } catch (err) {
      return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 });
  }
}
