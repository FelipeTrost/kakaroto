import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";
import { env } from "@/env.js";
import postgres from "postgres";

const postgresArgs = {
  host: env.DATABASE_URL,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  db: env.DATABASE_NAME,
};

const migrationClient = postgres({ ...postgresArgs, max: 1 });
await migrate(drizzle(migrationClient), {
  migrationsFolder: "./drizzle",
});
await migrationClient.end();

const queryClient = postgres(postgresArgs);
export const db = drizzle(queryClient, { schema });
