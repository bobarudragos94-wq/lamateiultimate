import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: authToken ? { url, authToken } : { url },
});
