import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const client = createClient({ 
      url: env.databaseUrl,
      authToken: env.databaseAuthToken || undefined,
    });
    instance = drizzle(client, {
      schema: fullSchema,
    });
  }
  return instance;
}
