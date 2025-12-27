import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env } from "@/env.js";
import postgres from "postgres";

console.log("connecting to db with", env.DATABASE_URL);
export const connection = postgres(env.DATABASE_URL);

export const db = drizzle(connection, { schema });
