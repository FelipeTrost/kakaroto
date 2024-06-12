import { type Config } from "drizzle-kit";

import { env } from "@/env.js";

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: env.DATABASE_URL,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  },
  tablesFilter: ["kakaroto_*"],
} satisfies Config;
