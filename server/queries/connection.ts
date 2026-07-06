import { createClient } from "@libsql/client/http";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let rawClient: ReturnType<typeof createClient>;

function ensureClient() {
  if (!rawClient) {
    if (!env.databaseUrl) {
      // Fail fast and loud — a request to an unconfigured/fake host would
      // otherwise hang on DNS resolution for 30-60+ seconds, which looks
      // exactly like an infinite spinner on the frontend.
      throw new Error(
        "DATABASE_URL is not set for this deployment. Check Vercel → Settings → Environment Variables — make sure it's set for the environment (Production/Preview) this deployment is running in.",
      );
    }
    rawClient = createClient({
      url: env.databaseUrl,
      authToken: env.databaseAuthToken || undefined,
    });
  }
  return rawClient;
}

export function getDb() {
  if (!instance) {
    const client = ensureClient();
    instance = drizzle(client, {
      schema: fullSchema,
    });
  }
  return instance;
}
