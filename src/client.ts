import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import { PerUserClientOptions, PerUserClient, DrizzleSchema } from "./types";

/**
 * Create a per-user database client with automatic migrations
 *
 * @param options - Configuration options for the per-user client
 * @returns A promise that resolves to a PerUserClient instance
 *
 * @example
 * ```ts
 * import { createClient } from '@libsql/client';
 * import { createPerUserClient } from 'create-per-user-client';
 * import * as schema from './db/schema';
 *
 * // Create your LibSQL client
 * const libsql = createClient({
 *   url: 'libsql://your-per-user-db-url.turso.io',
 *   authToken: 'some-group-token'
 * });
 *
 * // Create a per-user client with migrations
 * const { db } = await createPerUserClient({
 *   libsql,
 *   schema,
 *   migrations: './drizzle/migrations',
 *   logger: true
 * });
 *
 * // Use the Drizzle instance
 * const users = await db.select().from(schema.users);
 * ```
 */
export async function createPerUserClient<
  T extends DrizzleSchema = DrizzleSchema,
>(options: PerUserClientOptions): Promise<PerUserClient<T>> {
  const db = drizzle(options.libsql, {
    schema: options.schema || {},
    logger: options.logger || false,
  });

  try {
    await migrate(db, options.migrations as any);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }

  return {
    libsql: options.libsql,
    db: db as LibSQLDatabase<T>,
    close: async () => {
      await options.libsql.close();
    },
  };
}
