import { PrismaClient } from '@prisma/client';

// Create a helper that attempts to instantiate PrismaClient with
// the new Prisma 7 options (adapter/accelerateUrl) and falls back
// to older `datasources` or no-arg constructors if necessary.

const databaseUrl = process.env.DATABASE_URL;

function createPrismaClient() {
  // Try the modern `adapter` option first (Prisma 7+).
  try {
    // Some Prisma versions expect `adapter` to be an object; others
    // accept different shapes. Use `any` to avoid TypeScript errors
    // and attempt runtime instantiation.
    if (databaseUrl) {
      try {
        // Preferred for Prisma 7+: pass `adapter` with the connection URL.
        // The exact adapter shape can vary; this works for compatible versions.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new PrismaClient({ adapter: { url: databaseUrl } } as any);
      } catch (err) {
        // If `adapter` shape isn't accepted, fall through and try `datasources`.
      }
    }

    // Fallback: try the older `datasources` option that some Prisma clients accept.
    if (databaseUrl) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new PrismaClient({
        datasources: { db: { url: databaseUrl } },
      } as any);
    }

    // Last resort: default constructor (relies on prisma config files).
    return new PrismaClient();
  } catch (finalErr) {
    // If all attempts fail, throw the last error to surface issues at startup.
    throw finalErr;
  }
}

const prisma = createPrismaClient();

export default prisma;
export type PrismaClientInstance = typeof prisma;
