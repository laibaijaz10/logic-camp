// File: src/lib/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  user?: JWTPayload;
  error?: string;
}

/**
 * Verify JWT token from request headers
 */
export async function verifyToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Prefer Authorization header over cookie to allow privileged tokens to override
    let token: string | undefined;

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback to cookie if no Authorization header present
    if (!token) {
      token = request.cookies.get('authToken')?.value;
    }

    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-super-secret-jwt-key");
    const { payload } = await jwtVerify(token, secret);

    // Handle both userId and id formats for backward compatibility
    const userId = payload.userId || payload.id;

    // Ensure payload has all required fields
    if (
      typeof userId !== "number" ||
      typeof payload.role !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      console.error("Invalid JWT payload:", payload);
      return { success: false, error: 'Invalid token payload' };
    }

    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return { success: false, error: 'Token expired' };
    }

    // Safe cast with normalized userId
    const user: JWTPayload = {
      userId: userId,
      email: payload.email,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
    };

    return { success: true, user };
  } catch (error) {
    console.error("Token verification error:", error);
    return { success: false, error: 'Token verification failed' };
  }
}

/**
 * Authenticate user middleware
 */
export async function authenticateUser(request: NextRequest): Promise<NextResponse | JWTPayload> {
  const authResult = await verifyToken(request);

  if (!authResult.success || !authResult.user) {
    return NextResponse.json({ error: authResult.error || "Authentication required" }, { status: 401 });
  }

  return authResult.user;
}

/**
 * Require specific roles for a route
 */
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<NextResponse | JWTPayload> => {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const payload = authResult as JWTPayload;
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    return payload;
  };
}
