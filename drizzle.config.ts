import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

export default {
  driver: "pg",
  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    connectionString: process.env.XATA_DB_URL!,
  },
  verbose: true,
  strict: true,
  out: "./src/lib/db",
} satisfies Config;
