import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTokenExpired } from "@/lib/auth-utils";

/**
 * POST /api/auth/verify-email
 * Verifies a user's email address using the token from the verification link.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Look up the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: "Invalid verification link" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (isTokenExpired(verificationToken.expires)) {
      // Delete the expired token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        {
          success: false,
          error: "Verification link has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 400 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
