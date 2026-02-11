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
