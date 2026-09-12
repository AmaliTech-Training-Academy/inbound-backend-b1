import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../api/v1/generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;