import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import config from "../config";

/**
 * PostgreSQL connection via the official Prisma 7 driver adapter (node-postgres).
 * DATABASE_URL example: postgresql://am_user:secret@localhost:5432/am_management?schema=public
 * Set DATABASE_SSL=true for managed providers (Neon, Supabase, RDS, Railway, Aiven).
 */
const createClient = () => {
  const adapter = new PrismaPg({
    connectionString: config.database_url,
    max: config.database_pool_max,
    ssl: config.database_ssl ? { rejectUnauthorized: false } : undefined,
  });

  return new PrismaClient({ adapter });
};

// Re-use one client across hot reloads in development / serverless warm starts.
const globalForPrisma = globalThis as unknown as {
  __amPrisma?: ReturnType<typeof createClient>;
};

const prisma = globalForPrisma.__amPrisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__amPrisma = prisma;
}

export { prisma };
