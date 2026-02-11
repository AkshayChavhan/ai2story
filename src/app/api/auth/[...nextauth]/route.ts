import { handlers } from "@/lib/auth";

/**
 * NextAuth.js API route handler.
 * Handles all /api/auth/* requests (signin, signout, callback, session, etc.)
 */
export const { GET, POST } = handlers;
