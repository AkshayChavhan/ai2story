import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton for database access.
 * In development, we store the client on globalThis to prevent
 * multiple instances due to Next.js hot-reloading.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
