import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./src/api/v1/prisma/schema.prisma",
  migrations: {
    path: "./src/api/v1/prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});