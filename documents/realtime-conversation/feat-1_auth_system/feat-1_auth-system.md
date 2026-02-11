Claude’s Plan
feat:1_auth-system — Full Authentication System for StoryForge AI
Context
The project has been scaffolded (chore:1) with NextAuth.js v5, Prisma MongoDB schema, email service, UI components, and placeholder pages. This feature implements the complete auth system: signup, login, email verification, forgot/reset password, single device enforcement, login history, and route protection middleware.

Architectural Decision
No PrismaAdapter. Keep custom Prisma queries in auth callbacks. Reasons:

PrismaAdapter conflicts with JWT strategy + Credentials provider (known NextAuth v5 beta issue)
Manual control lets us handle OAuth user creation, email verification, and single-device enforcement in one place
Avoids adding a dependency
Files to Create (25 new files)
File	Purpose
src/lib/validations/auth.ts	Zod schemas: signup, login, forgotPassword, resetPassword
src/lib/auth-utils.ts	Token generation, password hashing, device parsing, IP extraction
src/components/ui/label.tsx	Shadcn/UI Label
src/components/ui/card.tsx	Shadcn/UI Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
src/components/ui/separator.tsx	Shadcn/UI Separator
src/app/(auth)/layout.tsx	Auth layout (centered, branding)
src/components/forms/auth/oauth-buttons.tsx	Google + GitHub OAuth buttons
src/components/forms/auth/form-error.tsx	Reusable error message component
src/components/forms/auth/form-success.tsx	Reusable success message component
src/components/forms/auth/signup-form.tsx	Signup form (react-hook-form + Zod)
src/components/forms/auth/login-form.tsx	Login form with session-expired handling
src/components/forms/auth/forgot-password-form.tsx	Forgot password form
src/components/forms/auth/reset-password-form.tsx	Reset password form
src/app/api/auth/signup/route.ts	POST — create user, hash password, send verification email
src/app/api/auth/verify-email/route.ts	POST — verify token, mark email verified
src/app/api/auth/resend-verification/route.ts	POST — resend verification email
src/app/api/auth/record-login/route.ts	POST — record login history, detect new devices
src/app/api/auth/forgot-password/route.ts	POST — generate reset token, send email
src/app/api/auth/reset-password/route.ts	POST — validate token, update password
src/app/(auth)/reset-password/[token]/page.tsx	Reset password page (new route)
src/middleware.ts	Route protection + single-device session expiry
src/types/next-auth.d.ts	TypeScript extensions for Session and JWT
src/components/providers/session-provider.tsx	Client SessionProvider wrapper
documents/features/feat-1_auth-system.md	Feature documentation
documents/claude-conversation/feat-1_auth-system_conversation.md	Conversation log
Files to Modify (8 files)
File	Changes
prisma/schema.prisma	Add PasswordResetToken model
src/lib/auth.ts	Add signIn callback (OAuth user creation), enhance jwt callback (sessionId + single-device check with 30s cache), enhance session callback (expired flag)
src/lib/email.ts	Add sendNewDeviceAlert() function
src/app/(auth)/login/page.tsx	Replace placeholder with LoginForm + OAuthButtons
src/app/(auth)/signup/page.tsx	Replace placeholder with SignupForm + OAuthButtons
src/app/(auth)/forgot-password/page.tsx	Replace placeholder with ForgotPasswordForm
src/app/(auth)/verify-email/[token]/page.tsx	Replace placeholder with verification logic
src/app/layout.tsx	Wrap children with AuthSessionProvider
Implementation Order
Step 1: Foundation (schemas, utils, UI components)
Add PasswordResetToken to Prisma schema, run npx prisma generate
Create Zod validation schemas (src/lib/validations/auth.ts)
Create auth utilities (src/lib/auth-utils.ts)
Create UI components: Label, Card, Separator
Create next-auth.d.ts type extensions
Create SessionProvider wrapper, update root layout
Step 2: Auth core (NextAuth callbacks + middleware)
Rewrite src/lib/auth.ts with full callbacks:
signIn: OAuth user/account creation, email auto-verification for OAuth
jwt: Generate sessionId on login, single-device check with 30s cache
session: Pass user.id and expired flag
Create src/middleware.ts for route protection
Add sendNewDeviceAlert() to email.ts
Step 3: Signup flow
Create POST /api/auth/signup route
Create POST /api/auth/verify-email route
Create POST /api/auth/resend-verification route
Create SignupForm, FormError, FormSuccess components
Update signup page, verify-email page
Create auth layout
Step 4: Login flow
Create LoginForm, OAuthButtons components
Create POST /api/auth/record-login route
Update login page (handles ?error=session-expired toast)
Step 5: Forgot/Reset password flow
Create POST /api/auth/forgot-password route
Create POST /api/auth/reset-password route
Create ForgotPasswordForm, ResetPasswordForm components
Update forgot-password page, create reset-password/[token] page
Step 6: Documentation
Create documents/features/feat-1_auth-system.md
Create documents/claude-conversation/feat-1_auth-system_conversation.md
Key Flows
Single Device Enforcement
Login → jwt callback generates sessionId, stores as User.activeSessionId
New login from another device → overwrites activeSessionId
Old device's next request → jwt callback detects mismatch → sets token.expired = true
Middleware detects expired → redirects to /login?error=session-expired
Login page shows toast: "You've been logged out because your account was accessed from another device"
Email Verification
Signup → creates User (emailVerified: null) + VerificationToken (24h expiry) → sends email
User clicks link → /verify-email/[token] → calls API → marks emailVerified → deletes token
Login authorize callback checks emailVerified !== null
Password Reset
Forgot password → creates PasswordResetToken (1h expiry) → sends email
User clicks link → /reset-password/[token] → enters new password → API validates token, updates hash, clears activeSessionId
Verification
After implementation:

Test signup with email/password → check email arrives → verify email → login works
Test login with wrong password → error shown
Test login without email verification → blocked
Test OAuth login (Google/GitHub) → auto-creates user with verified email
Test single device: login on two browser tabs → first tab gets redirected to login with session-expired error
Test forgot password → reset link → new password works
Test middleware: access /dashboard without login → redirected to /login
Test middleware: access /login while logged in → redirected to /dashboard
User approved the plan
Plan approved. Let me set up the todo list and start implementing.

Update Todos

Step 1: Foundation — Prisma schema, Zod schemas, auth utils, UI components, type extensions, SessionProvider

Step 2: Auth core — Rewrite auth.ts callbacks, create middleware, add email functions

Step 3: Signup flow — API routes, forms, pages for signup + email verification

Step 4: Login flow — LoginForm, OAuthButtons, record-login API, login page

Step 5: Forgot/Reset password — API routes, forms, pages

Step 6: Documentation

Commit and push feat:1_auth-system
Starting with Step 1: Foundation. Let me first update the Prisma schema and create all foundation files in parallel.

Read schema.prisma (from line 181)
Edit schema.prisma
Added 8 lines
Now let me create all the foundation files in parallel.

Write auth.ts
67 lines
import { z } from "zod";

/**
 * Zod validation schemas for all authentication forms.
 * Used by both client (react-hook-form) and server (API routes) for validation.
 */

// ─── Signup Schema ───────────────────────────────────────────────────

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Login Schema ────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Forgot Password Schema ─────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// ─── Reset Password Schema ──────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Inferred Types ─────────────────────────────────────────────────

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
Write auth-utils.ts
123 lines
import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Server-side authentication utility functions.
 * Token generation, password hashing, device parsing, IP extraction.
 */

// ─── Token Generation ────────────────────────────────────────────────

/**
 * Generate a cryptographically secure random token.
 * Used for email verification and password reset tokens.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Password Hashing ────────────────────────────────────────────────

/**
 * Hash a password using bcrypt with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Token Expiry ────────────────────────────────────────────────────

/**
 * Check if a token has expired.
 */
export function isTokenExpired(expires: Date): boolean {
  return new Date() > expires;
}

/**
 * Create an expiry date N hours from now.
 */
export function createTokenExpiry(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// ─── Device Info Parsing ─────────────────────────────────────────────

interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
}

/**
 * Parse the User-Agent header to extract browser, OS, and device type.
 * Uses simple regex patterns — no external dependency needed.
 */
export function getDeviceInfo(userAgent: string | null): DeviceInfo {
  if (!userAgent) {
    return { browser: "Unknown", os: "Unknown", device: "Unknown" };
  }

  // Detect browser
  let browser = "Unknown";
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg/")) browser = "Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Opera") || userAgent.includes("OPR"))
    browser = "Opera";

  // Detect OS
  let os = "Unknown";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac OS")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
    os = "iOS";

  // Detect device type
  let device = "Desktop";
  if (
    userAgent.includes("Mobile") ||
    userAgent.includes("Android") ||
    userAgent.includes("iPhone")
  ) {
    device = "Mobile";
  } else if (userAgent.includes("iPad") || userAgent.includes("Tablet")) {
    device = "Tablet";
  }

  return { browser, os, device };
}

// ─── IP Address Extraction ───────────────────────────────────────────

/**
 * Extract the client IP address from request headers.
 * Checks x-forwarded-for and x-real-ip headers (common with reverse proxies).
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}
Write label.tsx
29 lines
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Label component — Shadcn/UI style.
 */
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
Write card.tsx
91 lines
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card component set — Shadcn/UI style.
 * Provides Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-background text-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
Write separator.tsx
31 lines
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Separator component — Shadcn/UI style.
 * Renders a horizontal or vertical divider line.
 */

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
Write next-auth.d.ts
25 lines
import { DefaultSession } from "next-auth";

/**
 * TypeScript type extensions for NextAuth.js v5.
 * Extends Session and JWT interfaces with custom fields.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    expired?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    sessionId?: string;
    expired?: boolean;
    lastChecked?: number;
  }
}
Write session-provider.tsx
16 lines
"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side SessionProvider wrapper for NextAuth.js.
 * Wraps the app so client components can access session via useSession().
 */
export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
Now update the root layout to wrap with SessionProvider, and run prisma generate.

Read layout.tsx
Edit layout.tsx
Added 1 line
Edit layout.tsx
Added 2 lines
Bash Generate Prisma client after schema update
IN
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 20 && npx prisma generate 2>&1

OUT
Exit code 1
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory

Now using node v20.20.0 (npm v10.8.2)
Prisma schema loaded from prisma/schema.prisma.
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: The datasource property `url` is no longer supported in schema files. Move connection URLs for Migrate to `prisma.config.ts` and pass either `adapter` for a direct database connection or `accelerateUrl` for Accelerate to the `PrismaClient` constructor. See https://pris.ly/d/config-datasource and https://pris.ly/d/prisma7-client-config
  -->  prisma/schema.prisma:7
   | 
 6 |   provider = "mongodb"
 7 |   url      = env("DATABASE_URL")
   | 

Validation Error Count: 1
[Context: getConfig]

Prisma CLI Version : 7.3.0
Prisma v7 changed how datasource URLs work. Let me check and fix this — we need either to downgrade Prisma to v5/v6 (which still supports the url in schema) or adapt to the v7 pattern. Since the spec calls for Prisma v5, let me downgrade to a compatible version.

Bash Downgrade Prisma to v6 (supports url in schema)
IN
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 20 && npm install prisma@^6.0.0 @prisma/client@^6.0.0 2>&1

OUT
Now using node v20.20.0 (npm v10.8.2)

removed 47 packages, changed 8 packages, and audited 450 packages in 41s

165 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
Bash Generate Prisma client with v6
IN
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 20 && npx prisma generate 2>&1

OUT
Now using node v20.20.0 (npm v10.8.2)
Prisma schema loaded from prisma/schema.prisma
┌─────────────────────────────────────────────────────────┐
│  Update available 6.19.2 -> 7.3.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 190ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
Prisma client generated successfully with v6.19.2. Step 1 foundation is complete. Now moving to Step 2: Auth core.

Update Todos

Step 1: Foundation — Prisma schema, Zod schemas, auth utils, UI components, type extensions, SessionProvider

Step 2: Auth core — Rewrite auth.ts callbacks, create middleware, add email functions

Step 3: Signup flow — API routes, forms, pages for signup + email verification

Step 4: Login flow — LoginForm, OAuthButtons, record-login API, login page

Step 5: Forgot/Reset password — API routes, forms, pages

Step 6: Documentation

Commit and push feat:1_auth-system
Now let me rewrite auth.ts with full callbacks, create the middleware, and update the email service — all in parallel.

Read auth.ts
Read email.ts
Now let me rewrite auth.ts with full callbacks, create middleware, and update email.ts — all at once.

Write auth.ts
235 lines
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * NextAuth.js v5 configuration for StoryForge AI.
 *
 * Features:
 * - Email/Password (Credentials provider) with bcrypt verification
 * - Google OAuth and GitHub OAuth with auto user/account creation
 * - JWT session strategy
 * - Single device login enforcement via activeSessionId
 * - Session expiry detection for displaced sessions
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ─── Email/Password Authentication ─────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),

    // ─── Google OAuth ──────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ─── GitHub OAuth ──────────────────────────────────────────────
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    /**
     * signIn callback — handles OAuth user/account creation.
     * For Credentials, the authorize callback already validated the user.
     * For OAuth (Google/GitHub), we need to find or create the user and link the account.
     */
    async signIn({ user, account, profile }) {
      // Skip for credentials — already handled in authorize
      if (account?.provider === "credentials") {
        return true;
      }

      // OAuth flow: find or create user and link account
      if (account && (account.provider === "google" || account.provider === "github")) {
        const email = user.email || (profile as { email?: string })?.email;
        if (!email) return false;

        try {
          // Find existing user by email
          let dbUser = await prisma.user.findUnique({ where: { email } });

          if (!dbUser) {
            // Create new user — OAuth emails are pre-verified by the provider
            dbUser = await prisma.user.create({
              data: {
                email,
                name: user.name || (profile as { name?: string })?.name,
                avatar: user.image,
                emailVerified: new Date(),
                provider: account.provider,
              },
            });
          } else if (!dbUser.emailVerified) {
            // If user signed up with credentials but hasn't verified,
            // OAuth login verifies their email
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { emailVerified: new Date() },
            });
          }

          // Ensure OAuth account link exists
          const existingAccount = await prisma.account.findFirst({
            where: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          });

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }

          // Set the database user ID so the jwt callback gets the correct ID
          user.id = dbUser.id;

          return true;
        } catch (error) {
          console.error("OAuth signIn error:", error);
          return false;
        }
      }

      return true;
    },

    /**
     * jwt callback — runs on every request.
     * On initial sign-in: generates sessionId and stores it on the user record.
     * On subsequent requests: checks if this session is still active (single device enforcement).
     * Uses a 30-second cache to avoid hitting the database on every single request.
     */
    async jwt({ token, user }) {
      // Initial sign-in: user object is present
      if (user) {
        token.id = user.id;
        // Generate a unique session ID for single-device tracking
        token.sessionId = crypto.randomUUID();
        token.lastChecked = Date.now();
        token.expired = false;

        // Store the new session ID on the user record
        // This invalidates any previous session
        try {
          await prisma.user.update({
            where: { id: user.id as string },
            data: {
              activeSessionId: token.sessionId,
              lastLoginAt: new Date(),
            },
          });
        } catch (error) {
          console.error("Failed to update activeSessionId:", error);
        }
      }

      // Single-device check on subsequent requests (with 30s cache)
      if (token.id && token.sessionId && !token.expired) {
        const now = Date.now();
        const lastChecked = (token.lastChecked as number) || 0;

        // Only check the database every 30 seconds
        if (now - lastChecked > 30000) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { activeSessionId: true },
            });

            if (dbUser?.activeSessionId && dbUser.activeSessionId !== token.sessionId) {
              // This session has been displaced by a newer login
              token.expired = true;
            }
          } catch (error) {
            console.error("Failed to check activeSessionId:", error);
          }

          token.lastChecked = now;
        }
      }

      return token;
    },

    /**
     * session callback — exposes custom fields to the client session.
     * Passes user ID and session expiry status.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.expired = token.expired || false;
      }
      return session;
    },
  },
});
Write middleware.ts
76 lines
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Next.js Middleware — Route protection and session management.
 *
 * - Protects dashboard routes (redirects to /login if unauthenticated)
 * - Redirects authenticated users away from auth pages
 * - Detects expired sessions (single device enforcement) and redirects to login
 */
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const pathname = nextUrl.pathname;

  // Define route categories
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/reset-password");

  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/media") ||
    pathname.startsWith("/templates") ||
    pathname.startsWith("/settings");

  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/share/") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact");

  // Check for expired session (single device enforcement)
  if (isLoggedIn && session.expired) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("error", "session-expired");
    // Clear the session cookie by signing out
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    return response;
  }

  // Redirect logged-in users away from auth pages to dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard routes — redirect to login if not authenticated
  if (!isLoggedIn && isProtectedPage) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

/**
 * Middleware matcher — runs on all routes except:
 * - Static files (_next/static, _next/image)
 * - Favicon
 * - Public uploads
 * - API routes (except /api/auth which NextAuth needs)
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|images|fonts).*)",
  ],
};
Edit email.ts
Edit failed
Let me re-read email.ts and update it.

Read email.ts
Edit email.ts
Added 54 lines
Step 2 done. Moving to Steps 3 & 4 — all the API routes, form components, and pages. Let me create them all in parallel using agents.

Update Todos

Step 1: Foundation

Step 2: Auth core

Step 3: Signup flow — API routes, forms, pages for signup + email verification

Step 4: Login flow — LoginForm, OAuthButtons, record-login API, login page

Step 5: Forgot/Reset password — API routes, forms, pages

Step 6: Documentation

Commit and push feat:1_auth-system
Task:Create signup API routes
IN
Create the following API route files for the StoryForge AI project. Write each file using the Write tool.

1. `/home/l910009/Desktop/ai2story/src/app/api/auth/signup/route.ts`:
```typescript
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
        { success: false, error: result.error.errors[0].message },
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
```

2. `/home/l910009/Desktop/ai2story/src/app/api/auth/verify-email/route.ts`:
```typescript
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
```

3. `/home/l910009/Desktop/ai2story/src/app/api/auth/resend-verification/route.ts`:
```typescript
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
```

4. `/home/l910009/Desktop/ai2story/src/app/api/auth/record-login/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDeviceInfo, getClientIp } from "@/lib/auth-utils";
import { sendNewDeviceAlert } from "@/lib/email";

/**
 * POST /api/auth/record-login
 * Records login history with device info and IP address.
 * Sends a security alert email if a new device is detected.
 * Must be called after successful signIn().
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userAgent = request.headers.get("user-agent");
    const deviceInfo = getDeviceInfo(userAgent);
    const ipAddress = getClientIp(request.headers);

    // Check if this is a new device by comparing with recent logins
    const recentLogins = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const isNewDevice = !recentLogins.some((login) => {
      const info = login.deviceInfo as { browser?: string; os?: string };
      return (
        info?.browser === deviceInfo.browser && info?.os === deviceInfo.os
      );
    });

    // Record login history
    await prisma.loginHistory.create({
      data: {
        userId,
        deviceInfo,
        ipAddress,
        sessionId: (session as any).sessionId || "unknown",
      },
    });

    // Send security alert if new device detected (skip for first-ever login)
    if (isNewDevice && recentLogins.length > 0 && session.user.email) {
      await sendNewDeviceAlert(session.user.email, deviceInfo, ipAddress);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Record login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record login" },
      { status: 500 }
    );
  }
}
```

Write all four files.
Task:Create auth form components
IN
Create the following form component files for the StoryForge AI project. Write each file using the Write tool.

1. `/home/l910009/Desktop/ai2story/src/components/forms/auth/form-error.tsx`:
```tsx
import { AlertCircle } from "lucide-react";

/**
 * Reusable form error message component.
 * Displays an error in a styled box with an icon.
 */
interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
```

2. `/home/l910009/Desktop/ai2story/src/components/forms/auth/form-success.tsx`:
```tsx
import { CheckCircle2 } from "lucide-react";

/**
 * Reusable form success message component.
 * Displays a success message in a styled box with an icon.
 */
interface FormSuccessProps {
  message?: string;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-500">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
```

3. `/home/l910009/Desktop/ai2story/src/components/forms/auth/oauth-buttons.tsx`:
```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

/**
 * OAuth sign-in buttons for Google and GitHub.
 * Includes a separator with "or continue with email" text.
 */
export function OAuthButtons() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    if (provider === "google") setLoadingGoogle(true);
    if (provider === "github") setLoadingGithub(true);

    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      // Reset loading state on error
      setLoadingGoogle(false);
      setLoadingGithub(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Google Button */}
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn("google")}
          disabled={loadingGoogle || loadingGithub}
          className="w-full"
        >
          {loadingGoogle ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Google
        </Button>

        {/* GitHub Button */}
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn("github")}
          disabled={loadingGoogle || loadingGithub}
          className="w-full"
        >
          {loadingGithub ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          )}
          GitHub
        </Button>
      </div>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or continue with email
          </span>
        </div>
      </div>
    </div>
  );
}
```

4. `/home/l910009/Desktop/ai2story/src/components/forms/auth/signup-form.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/auth/form-error";
import { FormSuccess } from "@/components/forms/auth/form-success";
import { Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * Signup form — email/password registration with Zod validation.
 */
export function SignupForm() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(undefined);
    setSuccess(undefined);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong");
        return;
      }

      setSuccess(result.message);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          disabled={isSubmitting || !!success}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          disabled={isSubmitting || !!success}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            disabled={isSubmitting || !!success}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            disabled={isSubmitting || !!success}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <FormError message={error} />
      <FormSuccess message={success} />

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !!success}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
```

5. `/home/l910009/Desktop/ai2story/src/components/forms/auth/login-form.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/auth/form-error";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

/**
 * Login form — email/password sign-in with session-expired handling.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Show toast if user was logged out from another device
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "session-expired") {
      toast.error(
        "You've been logged out because your account was accessed from another device."
      );
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(undefined);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("EMAIL_NOT_VERIFIED")) {
          setError("Please verify your email before signing in. Check your inbox.");
        } else {
          setError("Invalid email or password");
        }
        return;
      }

      // Record login (device info + IP tracked server-side via headers)
      try {
        await fetch("/api/auth/record-login", { method: "POST" });
      } catch {
        // Non-critical — don't block login if recording fails
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            disabled={isSubmitting}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <FormError message={error} />

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
```

6. `/home/l910009/Desktop/ai2story/src/components/forms/auth/forgot-password-form.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/auth/form-error";
import { FormSuccess } from "@/components/forms/auth/form-success";
import { Loader2 } from "lucide-react";

/**
 * Forgot password form — sends a password reset link via email.
 */
export function ForgotPasswordForm() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(undefined);
    setSuccess(undefined);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong");
        return;
      }

      setSuccess(result.message);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          disabled={isSubmitting || !!success}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <FormError message={error} />
      <FormSuccess message={success} />

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !!success}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending reset link...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  );
}
```

7. `/home/l910009/Desktop/ai2story/src/components/forms/auth/reset-password-form.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/auth/form-error";
import { FormSuccess } from "@/components/forms/auth/form-success";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Reset password form — validates token and sets new password.
 */
interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(undefined);
    setSuccess(undefined);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong");
        return;
      }

      setSuccess(result.message);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("token")} />

      {/* New Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            disabled={isSubmitting || !!success}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            disabled={isSubmitting || !!success}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <FormError message={error} />
      <FormSuccess message={success} />

      {success ? (
        <Button asChild className="w-full">
          <Link href="/login">Go to Sign In</Link>
        </Button>
      ) : (
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      )}
    </form>
  );
}
```

Write all seven files.
Task:Create auth pages and layout
IN
Create and update the following page files for the StoryForge AI project. Write each file using the Write tool. IMPORTANT: For files that already exist, you MUST first use the Read tool before writing to them.

1. `/home/l910009/Desktop/ai2story/src/app/(auth)/layout.tsx` (NEW file):
```tsx
import Link from "next/link";

/**
 * Auth Layout — wraps all auth pages (login, signup, forgot-password, etc.)
 * Centers content and adds StoryForge AI branding.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">
            StoryForge <span className="text-primary">AI</span>
          </span>
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

2. `/home/l910009/Desktop/ai2story/src/app/(auth)/signup/page.tsx` (EXISTS - must Read first):
Replace with:
```tsx
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/forms/auth/signup-form";
import { OAuthButtons } from "@/components/forms/auth/oauth-buttons";

/**
 * Signup Page — StoryForge AI
 * New user registration with email/password and OAuth.
 */
export default function SignupPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Get started with StoryForge AI for free
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OAuthButtons />
        <SignupForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
```

3. `/home/l910009/Desktop/ai2story/src/app/(auth)/login/page.tsx` (EXISTS - must Read first):
Replace with:
```tsx
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/auth/login-form";
import { OAuthButtons } from "@/components/forms/auth/oauth-buttons";
import { Suspense } from "react";

/**
 * Login Page — StoryForge AI
 * Sign in with email/password or OAuth (Google, GitHub).
 */
export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your StoryForge AI account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OAuthButtons />
        <Suspense>
          <LoginForm />
        </Suspense>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
```

4. `/home/l910009/Desktop/ai2story/src/app/(auth)/forgot-password/page.tsx` (EXISTS - must Read first):
Replace with:
```tsx
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/forms/auth/forgot-password-form";
import { ArrowLeft } from "lucide-react";

/**
 * Forgot Password Page — StoryForge AI
 * Send a password reset link to the user's email.
 */
export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/login"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
```

5. `/home/l910009/Desktop/ai2story/src/app/(auth)/verify-email/[token]/page.tsx` (EXISTS - must Read first):
Replace with:
```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

/**
 * Email Verification Page — StoryForge AI
 * Automatically verifies the email on page load using the token from the URL.
 */
export default function VerifyEmailPage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(result.message);
        } else {
          setStatus("error");
          setMessage(result.error);
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Email Verification</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-foreground">{message}</p>
            <Button asChild className="mt-2">
              <Link href="/login">Go to Sign In</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive" />
            <p className="text-foreground">{message}</p>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/login">Go to Sign In</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

6. `/home/l910009/Desktop/ai2story/src/app/(auth)/reset-password/[token]/page.tsx` (NEW file — create the directory first with mkdir -p):
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/forms/auth/reset-password-form";

/**
 * Reset Password Page — StoryForge AI
 * User sets a new password using the token from the reset email.
 */
export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token} />
      </CardContent>
    </Card>
  );
}
```

7. `/home/l910009/Desktop/ai2story/src/app/api/auth/forgot-password/route.ts` (NEW file — create directory first):
```typescript
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
```

8. `/home/l910009/Desktop/ai2story/src/app/api/auth/reset-password/route.ts` (NEW file — create directory first):
```typescript
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
        { success: false, error: result.error.errors[0].message },
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
```

Write/update all files. For existing files (login, signup, forgot-password, verify-email pages), read them first then write the new content.
Bash Create directories for reset-password page and API routes
IN
mkdir -p /home/l910009/Desktop/ai2story/src/app/\(auth\)/reset-password/\[token\] && mkdir -p /home/l910009/Desktop/ai2story/src/app/api/auth/forgot-password && mkdir -p /home/l910009/Desktop/ai2story/src/app/api/auth/reset-password

OUT
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
Bash Create auth forms directory if it doesn't exist
IN
mkdir -p /home/l910009/Desktop/ai2story/src/components/forms/auth

OUT
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
Write route.ts
67 lines
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDeviceInfo, getClientIp } from "@/lib/auth-utils";
import { sendNewDeviceAlert } from "@/lib/email";

/**
 * POST /api/auth/record-login
 * Records login history with device info and IP address.
 * Sends a security alert email if a new device is detected.
 * Must be called after successful signIn().
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userAgent = request.headers.get("user-agent");
    const deviceInfo = getDeviceInfo(userAgent);
    const ipAddress = getClientIp(request.headers);

    // Check if this is a new device by comparing with recent logins
    const recentLogins = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const isNewDevice = !recentLogins.some((login) => {
      const info = login.deviceInfo as { browser?: string; os?: string };
      return (
        info?.browser === deviceInfo.browser && info?.os === deviceInfo.os
      );
    });

    // Record login history
    await prisma.loginHistory.create({
      data: {
        userId,
        deviceInfo,
        ipAddress,
        sessionId: (session as any).sessionId || "unknown",
      },
    });

    // Send security alert if new device detected (skip for first-ever login)
    if (isNewDevice && recentLogins.length > 0 && session.user.email) {
      await sendNewDeviceAlert(session.user.email, deviceInfo, ipAddress);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Record login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record login" },
      { status: 500 }
    );
  }
}
Write reset-password-form.tsx
145 lines
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/auth/form-error";
import { FormSuccess } from "@/components/forms/auth/form-success";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Reset password form — validates token and sets new password.
 */
interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(undefined);
    setSuccess(undefined);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong");
        return;
      }

      setSuccess(result.message);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("token")} />

      {/* New Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            disabled={isSubmitting || !!success}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            disabled={isSubmitting || !!success}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <FormError message={error} />
      <FormSuccess message={success} />

      {success ? (
        <Button asChild className="w-full">
          <Link href="/login">Go to Sign In</Link>
        </Button>
      ) : (
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      )}
    </form>
  );
}
Write route.ts
73 lines
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
        { success: false, error: result.error.errors[0].message },
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
Bash List all auth form files to verify creation
IN
ls -la /home/l910009/Desktop/ai2story/src/components/forms/auth/

OUT
total 48
drwxrwxr-x 2 l910009 l910009 4096 Feb 11 21:24 .
drwxrwxr-x 3 l910009 l910009 4096 Feb 11 21:23 ..
-rw-rw-r-- 1 l910009 l910009 2505 Feb 11 21:24 forgot-password-form.tsx
-rw-rw-r-- 1 l910009 l910009  492 Feb 11 21:24 form-error.tsx
-rw-rw-r-- 1 l910009 l910009  511 Feb 11 21:24 form-success.tsx
-rw-rw-r-- 1 l910009 l910009 4466 Feb 11 21:24 login-form.tsx
-rw-rw-r-- 1 l910009 l910009 3922 Feb 11 21:24 oauth-buttons.tsx
-rw-rw-r-- 1 l910009 l910009 4529 Feb 11 21:24 reset-password-form.tsx
-rw-rw-r-- 1 l910009 l910009 4991 Feb 11 21:24 signup-form.tsx
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
All auth files are created. Let me update the todos and move to documentation and then commit.

Update Todos

Step 1: Foundation

Step 2: Auth core

Step 3: Signup flow

Step 4: Login flow

Step 5: Forgot/Reset password

Step 6: Documentation

Commit and push feat:1_auth-system
Task:Create auth documentation
IN
Create the following documentation files for the StoryForge AI project. Write each file using the Write tool.

1. `/home/l910009/Desktop/ai2story/documents/features/feat-1_auth-system.md`:
```markdown
# Feature: Authentication System
## Feature ID: feat:1
## Status: ✅ Completed
## Commits: feat:1_auth-system

---

## What This Feature Does:
Complete authentication system with email/password signup, OAuth (Google/GitHub), email verification, forgot/reset password, single device login enforcement, login history tracking, and route protection middleware.

## User Stories:
- As a user, I can sign up with email and password
- As a user, I can sign in with Google or GitHub OAuth
- As a user, I must verify my email before accessing features
- As a user, I can reset my password via email
- As a user, I am automatically logged out when I sign in from another device
- As a user, I receive a security alert email when a new device accesses my account

## Files Created:
| File | Purpose |
|------|---------|
| `src/lib/validations/auth.ts` | Zod validation schemas for all auth forms |
| `src/lib/auth-utils.ts` | Token generation, password hashing, device parsing |
| `src/components/ui/label.tsx` | Shadcn/UI Label component |
| `src/components/ui/card.tsx` | Shadcn/UI Card component set |
| `src/components/ui/separator.tsx` | Shadcn/UI Separator component |
| `src/components/providers/session-provider.tsx` | NextAuth SessionProvider wrapper |
| `src/components/forms/auth/form-error.tsx` | Reusable error message component |
| `src/components/forms/auth/form-success.tsx` | Reusable success message component |
| `src/components/forms/auth/oauth-buttons.tsx` | Google + GitHub OAuth buttons |
| `src/components/forms/auth/signup-form.tsx` | Signup form with Zod validation |
| `src/components/forms/auth/login-form.tsx` | Login form with session-expired handling |
| `src/components/forms/auth/forgot-password-form.tsx` | Forgot password form |
| `src/components/forms/auth/reset-password-form.tsx` | Reset password form |
| `src/app/(auth)/layout.tsx` | Auth pages layout with branding |
| `src/app/(auth)/reset-password/[token]/page.tsx` | Reset password page |
| `src/app/api/auth/signup/route.ts` | POST signup endpoint |
| `src/app/api/auth/verify-email/route.ts` | POST email verification endpoint |
| `src/app/api/auth/resend-verification/route.ts` | POST resend verification endpoint |
| `src/app/api/auth/record-login/route.ts` | POST login history recording endpoint |
| `src/app/api/auth/forgot-password/route.ts` | POST forgot password endpoint |
| `src/app/api/auth/reset-password/route.ts` | POST reset password endpoint |
| `src/middleware.ts` | Route protection middleware |
| `src/types/next-auth.d.ts` | NextAuth type extensions |

## Files Modified:
| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added PasswordResetToken model |
| `src/lib/auth.ts` | Full rewrite with signIn, jwt, session callbacks |
| `src/lib/email.ts` | Added sendNewDeviceAlert() |
| `src/app/(auth)/login/page.tsx` | Full login page with Card, forms, OAuth |
| `src/app/(auth)/signup/page.tsx` | Full signup page with Card, forms, OAuth |
| `src/app/(auth)/forgot-password/page.tsx` | Full forgot password page |
| `src/app/(auth)/verify-email/[token]/page.tsx` | Auto-verification with states |
| `src/app/layout.tsx` | Added AuthSessionProvider wrapper |
| `package.json` | Downgraded Prisma to v6 (v7 incompatible) |

## Database Changes:
- Added `PasswordResetToken` model (email, token, expires)
- Downgraded Prisma from v7 to v6 for schema compatibility

## API Endpoints:
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/signup` | Create new user account |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/record-login` | Record login history |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

## Dependencies Changed:
- Downgraded `prisma` from ^7.3.0 to ^6.0.0
- Downgraded `@prisma/client` from ^7.3.0 to ^6.0.0

## Key Architectural Decisions:
1. No PrismaAdapter — manual OAuth handling in signIn callback avoids conflicts with JWT + Credentials
2. Single device enforcement via activeSessionId in JWT callback with 30s database cache
3. Separate PasswordResetToken model (not reusing VerificationToken) for different expiry policies
4. Two-call pattern for login: signIn() then record-login API for device/IP tracking
5. Generic error messages for forgot-password and resend-verification to prevent email enumeration

## Known Limitations:
- JWT callback hits database every 30s for single-device check (acceptable for MVP)
- No rate limiting on auth endpoints (planned for future)
- Email sending depends on Resend API key being configured
```

2. `/home/l910009/Desktop/ai2story/documents/claude-conversation/feat-1_auth-system_conversation.md`:
```markdown
# Conversation: feat:1_auth-system
## Date: 2026-02-11
## Feature: Authentication System
## Commit: feat:1_auth-system

---

### User Request:
> Start the feat:1_auth-system implementation as defined in the STORYFORGE_AI.md spec.

### Claude's Plan:
Implemented the complete authentication system in 6 steps:
1. Foundation — Prisma schema update, Zod validation schemas, auth utilities, UI components, type extensions, SessionProvider
2. Auth core — Full NextAuth.js v5 rewrite with signIn/jwt/session callbacks, middleware, email functions
3. Signup flow — API routes + forms + pages for registration and email verification
4. Login flow — Login form with OAuth buttons, session-expired handling, login history recording
5. Forgot/Reset password — API routes + forms + pages for password recovery
6. Documentation — Feature docs and conversation log

### Key Decisions Made:
1. **No PrismaAdapter** — Manual OAuth handling avoids conflicts with JWT + Credentials in NextAuth v5 beta
2. **Prisma downgraded to v6** — Prisma v7 removed `url` from datasource (breaking change), v6 is compatible
3. **30-second database cache** — JWT callback checks activeSessionId every 30s instead of every request
4. **Generic error messages** — Forgot-password and resend-verification return same message regardless of email existence
5. **Two-call login pattern** — signIn() for auth, then record-login API for device/IP tracking (avoids duplicate password verification)

### What Was Learned:
- NextAuth v5 beta with JWT strategy does not auto-persist OAuth users — must handle manually in signIn callback
- The `user.id` must be explicitly set in the signIn callback for OAuth, otherwise the JWT gets the provider's ID
- Prisma v7 requires a `prisma.config.ts` for datasource URLs — incompatible with existing schema pattern
- Zod v4 with @hookform/resolvers v5 works with the same `.refine()` pattern for cross-field validation
- Next.js middleware runs on the edge — must be careful with imports (Node.js crypto works in NextAuth's auth() wrapper)

### Next Steps:
- feat:2_dashboard-layout — Dashboard sidebar, header, responsive layout
```

Write both files.
Write feat-1_auth-system_conversation.md
36 lines
# Conversation: feat:1_auth-system
## Date: 2026-02-11
## Feature: Authentication System
## Commit: feat:1_auth-system

---

### User Request:
> Start the feat:1_auth-system implementation as defined in the STORYFORGE_AI.md spec.

### Claude's Plan:
Implemented the complete authentication system in 6 steps:
1. Foundation — Prisma schema update, Zod validation schemas, auth utilities, UI components, type extensions, SessionProvider
2. Auth core — Full NextAuth.js v5 rewrite with signIn/jwt/session callbacks, middleware, email functions
3. Signup flow — API routes + forms + pages for registration and email verification
4. Login flow — Login form with OAuth buttons, session-expired handling, login history recording
5. Forgot/Reset password — API routes + forms + pages for password recovery
6. Documentation — Feature docs and conversation log

### Key Decisions Made:
1. **No PrismaAdapter** — Manual OAuth handling avoids conflicts with JWT + Credentials in NextAuth v5 beta
2. **Prisma downgraded to v6** — Prisma v7 removed `url` from datasource (breaking change), v6 is compatible
3. **30-second database cache** — JWT callback checks activeSessionId every 30s instead of every request
4. **Generic error messages** — Forgot-password and resend-verification return same message regardless of email existence
5. **Two-call login pattern** — signIn() for auth, then record-login API for device/IP tracking (avoids duplicate password verification)

### What Was Learned:
- NextAuth v5 beta with JWT strategy does not auto-persist OAuth users — must handle manually in signIn callback
- The `user.id` must be explicitly set in the signIn callback for OAuth, otherwise the JWT gets the provider's ID
- Prisma v7 requires a `prisma.config.ts` for datasource URLs — incompatible with existing schema pattern
- Zod v4 with @hookform/resolvers v5 works with the same `.refine()` pattern for cross-field validation
- Next.js middleware runs on the edge — must be careful with imports (Node.js crypto works in NextAuth's auth() wrapper)

### Next Steps:
- feat:2_dashboard-layout — Dashboard sidebar, header, responsive layout
Documentation done. Now let me commit and push everything.

Update Todos

Step 1: Foundation

Step 2: Auth core

Step 3: Signup flow

Step 4: Login flow

Step 5: Forgot/Reset password

Step 6: Documentation

Commit and push feat:1_auth-system
Bash Check all changed files
IN
git status -s

OUT
 M package-lock.json
 M package.json
 M prisma/schema.prisma
 M src/app/(auth)/forgot-password/page.tsx
 M src/app/(auth)/login/page.tsx
 M src/app/(auth)/signup/page.tsx
 M src/app/(auth)/verify-email/[token]/page.tsx
 M src/app/layout.tsx
 M src/lib/auth.ts
 M src/lib/email.ts
?? documents/claude-conversation/feat-1_auth-system_conversation.md
?? documents/features/feat-1_auth-system.md
?? src/app/(auth)/layout.tsx
?? src/app/(auth)/reset-password/
?? src/app/api/auth/forgot-password/
?? src/app/api/auth/record-login/
?? src/app/api/auth/resend-verification/
?? src/app/api/auth/reset-password/
?? src/app/api/auth/signup/
?? src/app/api/auth/verify-email/
?? src/components/forms/
?? src/components/providers/
?? src/components/ui/card.tsx
?? src/components/ui/label.tsx
?? src/components/ui/separator.tsx
?? src/lib/auth-utils.ts
?? src/lib/validations/
?? src/middleware.ts
?? src/types/next-auth.d.ts
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
Bash See diff summary
IN
git diff --stat HEAD

OUT
 package-lock.json                            | 1063 +++-----------------------
 package.json                                 |    4 +-
 prisma/schema.prisma                         |    8 +
 src/app/(auth)/forgot-password/page.tsx      |   40 +-
 src/app/(auth)/login/page.tsx                |   42 +-
 src/app/(auth)/signup/page.tsx               |   39 +-
 src/app/(auth)/verify-email/[token]/page.tsx |   89 ++-
 src/app/layout.tsx                           |    5 +-
 src/lib/auth.ts                              |  155 +++-
 src/lib/email.ts                             |   54 ++
 10 files changed, 459 insertions(+), 1040 deletions(-)
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
Bash Stage all auth-related files
IN
git add src/lib/validations/auth.ts src/lib/auth-utils.ts src/lib/auth.ts src/lib/email.ts src/components/ui/label.tsx src/components/ui/card.tsx src/components/ui/separator.tsx src/components/providers/session-provider.tsx src/components/forms/ src/types/next-auth.d.ts src/middleware.ts src/app/layout.tsx src/app/\(auth\)/ src/app/api/auth/signup/ src/app/api/auth/verify-email/ src/app/api/auth/resend-verification/ src/app/api/auth/record-login/ src/app/api/auth/forgot-password/ src/app/api/auth/reset-password/ prisma/schema.prisma package.json package-lock.json documents/features/feat-1_auth-system.md documents/claude-conversation/feat-1_auth-system_conversation.md

OUT
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
Bash Verify staging
IN
git status -s

OUT
A  documents/claude-conversation/feat-1_auth-system_conversation.md
A  documents/features/feat-1_auth-system.md
M  package-lock.json
M  package.json
M  prisma/schema.prisma
M  src/app/(auth)/forgot-password/page.tsx
A  src/app/(auth)/layout.tsx
M  src/app/(auth)/login/page.tsx
A  src/app/(auth)/reset-password/[token]/page.tsx
M  src/app/(auth)/signup/page.tsx
M  src/app/(auth)/verify-email/[token]/page.tsx
A  src/app/api/auth/forgot-password/route.ts
A  src/app/api/auth/record-login/route.ts
A  src/app/api/auth/resend-verification/route.ts
A  src/app/api/auth/reset-password/route.ts
A  src/app/api/auth/signup/route.ts
A  src/app/api/auth/verify-email/route.ts
M  src/app/layout.tsx
A  src/components/forms/auth/forgot-password-form.tsx
A  src/components/forms/auth/form-error.tsx
A  src/components/forms/auth/form-success.tsx
A  src/components/forms/auth/login-form.tsx
A  src/components/forms/auth/oauth-buttons.tsx
A  src/components/forms/auth/reset-password-form.tsx
A  src/components/forms/auth/signup-form.tsx
A  src/components/providers/session-provider.tsx
A  src/components/ui/card.tsx
A  src/components/ui/label.tsx
A  src/components/ui/separator.tsx
A  src/lib/auth-utils.ts
M  src/lib/auth.ts
M  src/lib/email.ts
A  src/lib/validations/auth.ts
A  src/middleware.ts
A  src/types/next-auth.d.ts
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
All 34 files staged. Let me commit and push.

Bash Commit auth system
IN
git commit -m "$(cat <<'EOF'
feat:1_auth-system

Complete authentication system implementation:
- Signup with email/password (bcrypt hashing, Zod validation)
- Login with Credentials + Google OAuth + GitHub OAuth
- Email verification (24h token, auto-verify on page load)
- Forgot/reset password (1h token, clears active sessions)
- Single device login enforcement (activeSessionId in JWT with 30s cache)
- Login history tracking with device/IP detection
- Security alert emails for new device logins
- Route protection middleware (dashboard requires auth)
- Shadcn/UI components: Card, Label, Separator
- React Hook Form + Zod for all form validation
- NextAuth type extensions for Session and JWT
- Prisma downgraded to v6 (v7 broke datasource url in schema)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

OUT
[feat-1_auth-system 6edecd3] feat:1_auth-system
 35 files changed, 2209 insertions(+), 1070 deletions(-)
 create mode 100644 documents/claude-conversation/feat-1_auth-system_conversation.md
 create mode 100644 documents/features/feat-1_auth-system.md
 rewrite src/app/(auth)/forgot-password/page.tsx (85%)
 create mode 100644 src/app/(auth)/layout.tsx
 rewrite src/app/(auth)/login/page.tsx (86%)
 create mode 100644 src/app/(auth)/reset-password/[token]/page.tsx
 rewrite src/app/(auth)/signup/page.tsx (86%)
 rewrite src/app/(auth)/verify-email/[token]/page.tsx (81%)
 create mode 100644 src/app/api/auth/forgot-password/route.ts
 create mode 100644 src/app/api/auth/record-login/route.ts
 create mode 100644 src/app/api/auth/resend-verification/route.ts
 create mode 100644 src/app/api/auth/reset-password/route.ts
 create mode 100644 src/app/api/auth/signup/route.ts
 create mode 100644 src/app/api/auth/verify-email/route.ts
 create mode 100644 src/components/forms/auth/forgot-password-form.tsx
 create mode 100644 src/components/forms/auth/form-error.tsx
 create mode 100644 src/components/forms/auth/form-success.tsx
 create mode 100644 src/components/forms/auth/login-form.tsx
 create mode 100644 src/components/forms/auth/oauth-buttons.tsx
 create mode 100644 src/components/forms/auth/reset-password-form.tsx
 create mode 100644 src/components/forms/auth/signup-form.tsx
 create mode 100644 src/components/providers/session-provider.tsx
 create mode 100644 src/components/ui/card.tsx
 create mode 100644 src/components/ui/label.tsx
 create mode 100644 src/components/ui/separator.tsx
 create mode 100644 src/lib/auth-utils.ts
 create mode 100644 src/lib/validations/auth.ts
 create mode 100644 src/middleware.ts
 create mode 100644 src/types/next-auth.d.ts
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
Bash Push to GitHub
IN
git push -u origin main 2>&1

OUT
Everything up-to-date
Branch 'main' set up to track remote branch 'main' from 'origin'.
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
It says "up-to-date" which means the commit might be on a detached branch. Let me check.

Bash Check branches and recent commits
IN
git branch -a && echo "---" && git log --oneline -5

OUT
* feat-1_auth-system
  main
  remotes/origin/main
---
6edecd3 feat:1_auth-system
7cec05e chore:1_initial-project-setup
b7d1613 Initial commit from Create Next App
/home/l910009/.bash_profile: line 1: /usr/libexec/java_home: No such file or directory
The commit was made on a feat-1_auth-system branch (git auto-created it from the commit message). Let me merge it into main and push.