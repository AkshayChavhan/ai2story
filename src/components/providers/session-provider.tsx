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
