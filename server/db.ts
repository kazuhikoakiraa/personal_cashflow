import { PrismaClient } from "@prisma/client";

// DEBUG - hapus setelah fix
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("DIRECT_URL exists:", !!process.env.DIRECT_URL);
console.log("DATABASE_URL preview:", process.env.DATABASE_URL?.slice(0, 30));

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;