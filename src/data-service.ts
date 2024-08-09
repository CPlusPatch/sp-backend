import type { Database } from "bun:sqlite";
import { z } from "zod";

/**
 * Represents a data row in the database.
 */
interface DataRow {
    id: string;
    tags: string[];
    banner_image: string;
    links: string[];
    content: string;
    title: string;
    created_at: string;
}

const rowSchema = z.object({
    id: z.coerce.string(),
    tags: z.array(z.string()),
    banner_image: z.string(),
    links: z.array(z.string()),
    content: z.string(),
    title: z.string(),
    created_at: z.string(),
});

/**
 * Service class for handling database operations.
 */
export class DataService {
    private db: Database;

    /**
     * Initializes the DataService with a database connection and creates the table if it doesn't exist.
     * @param db - The SQLite database connection.
     */
    constructor(db: Database) {
        this.db = db;
        this.initializeTable();
    }

    /**
     * Creates the data table if it doesn't exist.
     */
    private initializeTable(): void {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS data_rows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tags JSON NOT NULL DEFAULT '[]',
                banner_image TEXT NOT NULL,
                links JSON NOT NULL DEFAULT '[]',
                content TEXT NOT NULL,
                title TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (id)
            )
        `);
        this.db.exec("PRAGMA journal_mode = WAL;");
    }

    /**
     * Retrieves all data rows from the database.
     * @returns An array of DataRow objects.
     */
    public getAllRows(): DataRow[] {
        const rows = this.db.query("SELECT * FROM data_rows").all();
        return rows.map(this.parseRow);
    }

    /**
     * Retrieves a single data row by its ID.
     * @param id - The ID of the data row to retrieve.
     * @returns The DataRow object if found, or null if not found.
     */
    public getRowById(id: string): DataRow | null {
        const row = this.db
            .query("SELECT * FROM data_rows WHERE id = ?")
            .get(id);
        return row ? this.parseRow(row) : null;
    }

    /**
     * Inserts a new data row into the database.
     * @param row - The DataRow object to insert.
     * @returns The ID of the newly inserted row.
     */
    public insertRow(row: Omit<DataRow, "id" | "created_at">): string {
        const { tags, banner_image, links, content, title } = row;
        const stmt = this.db.prepare(`
      INSERT INTO data_rows (tags, banner_image, links, content, title)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(
            JSON.stringify(tags),
            banner_image,
            JSON.stringify(links),
            content,
            title,
        );
        return String(result.lastInsertRowid);
    }

    /**
     * Updates an existing data row in the database.
     * @param id - The ID of the row to update.
     * @param row - The updated DataRow object.
     * @returns True if the update was successful, false otherwise.
     */
    public updateRow(
        id: string,
        row: Partial<Omit<DataRow, "id" | "created_at">>,
    ): boolean {
        const fields: string[] = [];
        const values: string[] = [];

        if (row.tags !== undefined) {
            fields.push("tags = ?");
            values.push(JSON.stringify(row.tags));
        }
        if (row.banner_image !== undefined) {
            fields.push("banner_image = ?");
            values.push(row.banner_image);
        }
        if (row.links !== undefined) {
            fields.push("links = ?");
            values.push(JSON.stringify(row.links));
        }
        if (row.content !== undefined) {
            fields.push("content = ?");
            values.push(row.content);
        }
        if (row.title !== undefined) {
            fields.push("title = ?");
            values.push(row.title);
        }

        if (fields.length === 0) {
            return false; // No fields to update
        }

        const stmt = this.db.prepare(`
        UPDATE data_rows
        SET ${fields.join(", ")}
        WHERE id = ?
    `);
        values.push(id);

        const result = stmt.run(...values);
        return result.changes > 0;
    }

    /**
     * Deletes a data row from the database.
     * @param id - The ID of the row to delete.
     * @returns True if the deletion was successful, false otherwise.
     */
    public deleteRow(id: string): boolean {
        const stmt = this.db.prepare("DELETE FROM data_rows WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }

    /**
     * Parses a raw database row into a DataRow object.
     * @param row - The raw database row.
     * @returns A DataRow object.
     */
    private parseRow(row: unknown): DataRow {
        if (typeof row !== "object" || row === null) {
            throw new Error("Invalid row data");
        }

        const parsed = rowSchema.safeParse({
            ...row,
            tags: (row as Record<string, unknown>).tags
                ? JSON.parse((row as Record<string, unknown>).tags as string)
                : undefined,
            links: (row as Record<string, unknown>).links
                ? JSON.parse((row as Record<string, unknown>).links as string)
                : undefined,
        });
        if (!parsed.success) {
            throw new Error(`Invalid row data: ${parsed.error.message}`);
        }
        return parsed.data;
    }
}
