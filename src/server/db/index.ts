import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { env } from "@/env.js";
import * as schema from "./schema";

function createDbConnection() {
  if (process.env.SKIP_ENV_VALIDATION) {
    const mockConnection = {} as unknown as Database.Database;
    return drizzle(mockConnection, { schema });
  }

  return drizzle(
    new Database(env.DATABASE_URL, {
      fileMustExist: false,
    }),
    { schema },
  );
}

export const db = createDbConnection();
