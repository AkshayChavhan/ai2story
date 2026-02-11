import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { generateToken, createTokenExpiry } from "@/lib/auth-utils";
import { sendPasswordResetEmail } from "@/lib/email";

/**
 * POST /api/auth/forgot-password
 * Generates a password reset token and sends an email.
 * Returns a generic success message regardless of whether the email exists (security).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find user — don't reveal if email exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.passwordHash) {
      // Delete any existing reset tokens for this email
      await prisma.passwordResetToken.deleteMany({ where: { email } });

      // Generate new token
      const token = generateToken();
      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expires: createTokenExpiry(1), // 1 hour
        },
      });

      // Send reset email
      await sendPasswordResetEmail(email, token);
    }

    // Always return the same message for security
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
