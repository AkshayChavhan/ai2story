import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { hashPassword, isTokenExpired } from "@/lib/auth-utils";

/**
 * POST /api/auth/reset-password
 * Validates the reset token and updates the user's password.
 * Clears activeSessionId to force re-login on all devices.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (isTokenExpired(resetToken.expires)) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json(
        { success: false, error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await hashPassword(password);

    // Update user's password and clear active session (force re-login)
    await prisma.user.update({
      where: { email: resetToken.email },
      data: {
        passwordHash,
        activeSessionId: null,
      },
    });

    // Delete the used reset token
    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
