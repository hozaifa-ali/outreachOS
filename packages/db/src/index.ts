/**
 * @module @outreachos/db
 * Prisma client singleton with org-scoped middleware for multi-tenancy.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma client instance.
 * Reuses the same connection across hot-reloads in development.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


export * from '@prisma/client';
export type { PrismaClient };
