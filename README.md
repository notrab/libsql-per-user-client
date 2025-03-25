# libsql-per-user-client

## Installation

```bash
npm install libsql-per-user-client @libsql/client drizzle-orm
npm install -D drizzle-kit
```

## Usage

1. Define your schema in `db/schema.ts`.
2. Generate migrations when schema changes:
   ```bash
   npx drizzle-kit generate
   ```
3. use the client in your application code:

```ts
import { createClient } from "@libsql/client";
import { createPerUserClient } from "libsql-drizzle-migrator";

import * as schema from "./db/schema";

const userId = "user123"; // your apps user id or other identifier
const accountSlug = "my-account"; // your turso account slug

const libsql = createClient({
  url: `libsql://${userId}-${accountSlug}.turso.io`,
  authToken: "<some-group-token>",
});

const client = await createPerUserClient({
  client: libsql,
  drizzle: {
    schema,
    migrations: './drizzle/migrations'
    logger: true,
  },
});

const db = client.getDrizzle();
const users = await db.select().from(schema.users);

const result = await client.execute("SELECT * FROM users");
```

## Drizzle Setup

1. Define your schema using Drizzle as normal in `db/schema.ts`:

   ```ts
   import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

   export const users = sqliteTable("users", {
     id: integer("id").primaryKey({ autoIncrement: true }),
     username: text("username").notNull().unique(),
     email: text("email").notNull().unique(),
     createdAt: integer("created_at", { mode: "timestamp" })
       .notNull()
       .$defaultFn(() => new Date()),
   });
   ```

2. Inside `drizzle.config.ts` add your config:

   ```ts
   import { defineConfig } from "drizzle-kit";

   export default defineConfig({
     out: "./drizzle",
     schema: "./db/schema.ts",
     dialect: "sqlite",
     driver: "turso", // or 'libsql'
   });
   ```

3. Generate migrations:

   ```bash
   npx drizzle-kit generate
   ```

4. Use the migration enhanced client in your application.

Your project structure should look something like this:

```bash
your-project/
├── db/
│   └── schema.ts         # Drizzle schema definitions
├── drizzle/
│   └── migrations/       # Generated migrations from drizzle-kit
│       ├── meta/         # Migration metadata
│       └── 0000_*.sql    # Migration SQL files
├── drizzle.config.ts     # Drizzle config
├── libsql-wrapper.ts     # Our migration client wrapper
└── app.ts                # Your application code
```

## How It Works

The client wrapper:

1. Takes your existing libSQL client instance
2. Initializes Drizzle ORM with your schema
3. Runs Drizzle's migrator to apply any pending migrations
4. Provides access to both Drizzle ORM and the original libSQL client

This client ensures your database schema is always up-to-date whenever a new client is created.
