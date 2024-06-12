import { migrate } from "drizzle-orm/postgres-js/migrator";
import { env } from "../../env.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

export const connection = postgres({
  host: env.DATABASE_URL,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  db: env.DATABASE_NAME,
});
console.log(env);

const db = drizzle(connection);
await migrate(db, { migrationsFolder: "./drizzle" });

await connection.end();
