import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env } from "@/env.js";
import postgres from "postgres";

export const connection = postgres(env.DATABASE_URL);

export const db = drizzle(connection, { schema });
