import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Declare global type for PrismaClient singleton in development
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  let host = process.env.DATABASE_HOST || "localhost";
  let port = Number(process.env.DATABASE_PORT) || 3306;
  let user = process.env.DATABASE_USER || "root";
  let password = process.env.DATABASE_PASSWORD || "";
  let database = process.env.DATABASE_NAME || "college_portal";
  let ssl: boolean | object | undefined = undefined;

  // Support cloud database connection strings (Vercel, Railway, Aiven, PlanetScale)
  if (process.env.DATABASE_URL) {
    try {
      const parsedUrl = new URL(process.env.DATABASE_URL);
      host = parsedUrl.hostname;
      if (parsedUrl.port) port = Number(parsedUrl.port);
      if (parsedUrl.username) user = decodeURIComponent(parsedUrl.username);
      if (parsedUrl.password) password = decodeURIComponent(parsedUrl.password);
      if (parsedUrl.pathname) database = parsedUrl.pathname.replace(/^\//, "");
      
      const sslParam = parsedUrl.searchParams.get("ssl") || parsedUrl.searchParams.get("sslaccept");
      if (sslParam || host !== "localhost" && host !== "127.0.0.1") {
        ssl = { rejectUnauthorized: false };
      }
    } catch {
      // fallback to discrete env vars
    }
  }

  const adapter = new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    ...(ssl ? { ssl } : {}),
    connectionLimit: process.env.NODE_ENV === "production" ? 5 : 10,
    connectTimeout: 8000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
