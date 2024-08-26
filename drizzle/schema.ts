import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Json } from "~/types/responses";

export const dataRows = sqliteTable("data_rows", {
    id: integer("id")
        .primaryKey({
            autoIncrement: true,
        })
        .notNull(),
    tags: text("tags", { mode: "json" })
        .$type<string[]>()
        .default([])
        .notNull(),
    image: text("image"),
    links: text("links", { mode: "json" })
        .$type<string[]>()
        .default([])
        .notNull(),
    // Tree links
    data: text("data", { mode: "json" }).$type<Json>(),
    content: text("content"),
    title: text("title"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});
