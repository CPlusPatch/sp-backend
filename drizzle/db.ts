import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

export const getDb = (path: string) => {
    const sqlite = new Database(path);
    const db = drizzle(sqlite);
    migrate(db, {
        migrationsFolder: "./drizzle/migrations",
    });
    return db;
};
