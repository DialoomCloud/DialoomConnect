import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import debug from "debug";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const log = debug("server:db");

let pool: Pool | undefined;
let db: any;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} catch (err) {
  log(
    "DATABASE_URL missing or database initialization failed, disabling database. %o",
    err,
  );
  process.env.DB_DISABLED = "true";

  db = new Proxy(
    {},
    {
      get: () => async () => undefined,
    },
  ) as any;
}

export { pool, db };
