// Reads .env when one is present. In production Render sets these as real
// environment variables and dotenv leaves them alone.
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

/**
 * One pool for the process. Astro's dev server reloads modules on every edit,
 * and a fresh pool per reload exhausts the database's connection limit — so it
 * is stashed on globalThis.
 */
const globalForDb = globalThis as unknown as { pool?: pg.Pool; prisma?: PrismaClient };

const pool =
  globalForDb.pool ??
  new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 8, idleTimeoutMillis: 30_000 });

export const prisma = globalForDb.prisma ?? new PrismaClient({ adapter: new PrismaPg(pool) });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
  globalForDb.prisma = prisma;
}
