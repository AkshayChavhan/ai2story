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

  trustHost: true,

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
