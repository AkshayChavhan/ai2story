import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";
import { hashPassword, generateToken, createTokenExpiry } from "@/lib/auth-utils";
import { sendVerificationEmail } from "@/lib/email";

/**
 * POST /api/auth/signup
 * Creates a new user account with email/password.
 * Sends a verification email with a token.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        provider: "credentials",
      },
    });

    // Generate verification token
    const token = generateToken();
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: createTokenExpiry(24), // 24 hours
      },
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json(
      {
        success: true,
        message: "Account created. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
