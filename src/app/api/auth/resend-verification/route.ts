import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, createTokenExpiry } from "@/lib/auth-utils";
import { sendVerificationEmail } from "@/lib/email";

/**
 * POST /api/auth/resend-verification
 * Resends the email verification link.
 * Returns a generic success message regardless of whether the email exists (security).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal whether the email exists
    if (!user || user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists and is unverified, we've sent a new verification link.",
      });
    }

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Generate new token
    const token = generateToken();
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: createTokenExpiry(24),
      },
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists and is unverified, we've sent a new verification link.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
