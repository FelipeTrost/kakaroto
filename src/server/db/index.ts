import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env } from "@/env.js";
import postgres from "postgres";

export const connection = postgres({
  host: env.DATABASE_URL,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  db: env.DATABASE_NAME,
});

export const db = drizzle(connection, { schema });
