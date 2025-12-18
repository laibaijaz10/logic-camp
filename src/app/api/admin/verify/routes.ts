// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ valid: false, error: "No token provided" }, { status: 401 });
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || "your-super-secret-jwt-key")
    );
    const decoded = payload;

    return NextResponse.json({ valid: true, decoded });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: "Invalid or expired token" }, { status: 401 });
  }
}
