import { Client as LibSQLClient } from "@libsql/client";
import { LibSQLDatabase } from "drizzle-orm/libsql";

/**
 * Migration configuration options
 * This can be:
 * - A string path to migrations folder
 * - An object with migrationsFolder property
 * - An object with migration names and SQL strings
 */
export type MigrationOptions =
  | string
  | { migrationsFolder: string }
  | Record<string, string>;

/**
 * Schema type for Drizzle ORM
 */
export type DrizzleSchema = Record<string, unknown>;

/**
 * Options for creating a per-user client
 */
export interface PerUserClientOptions {
  /**
   * LibSQL client configuration
   */
  libsql: LibSQLClient;

  /**
   * Drizzle ORM schema
   */
  schema?: DrizzleSchema;

  /**
   * Migrations configuration
   */
  migrations: MigrationOptions;

  /**
   * Enable SQL query logging
   */
  logger?: boolean;
}

/**
 * Result of creating a per-user client
 */
export interface PerUserClient<T extends DrizzleSchema = DrizzleSchema> {
  /**
   * The LibSQL client instance
   */
  libsql: LibSQLClient;

  /**
   * The Drizzle ORM database instance
   */
  db: LibSQLDatabase<T>;

  /**
   * Close the database connection
   */
  close: () => Promise<void>;
}
