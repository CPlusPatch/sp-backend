import type { Database } from "bun:sqlite";
import { describe, expect, mock, test } from "bun:test";
import { DataService } from "./data-service";

describe("DataService", () => {
    // Mock database for testing
    const mockDb = {
        run: mock(() => {
            //
        }),
        exec: mock(() => {
            //
        }),
        query: mock(() => ({
            all: () => [],
            get: () => null,
        })),
        prepare: mock(() => ({
            run: mock(() => ({ lastInsertRowid: 1, changes: 1 })),
        })),
    } as unknown as Database;

    test("getAllRows returns an empty array", () => {
        const dataService = new DataService(mockDb);
        const rows = dataService.getAllRows();
        expect(rows).toBeInstanceOf(Array);
        expect(rows.length).toBe(0);
    });

    test("getRowById returns null for non-existent row", () => {
        const dataService = new DataService(mockDb);
        const row = dataService.getRowById(1);
        expect(row).toBeNull();
    });

    test("insertRow returns the new row id", () => {
        const dataService = new DataService(mockDb);
        const newRow = {
            tags: ["test"],
            banner_image: "test.jpg",
            links: ["https://example.com"],
            content: "Test content",
            title: "Test title",
        };
        const id = dataService.insertRow(newRow);
        expect(id).toBe(1);
    });

    test("updateRow returns true for successful update", () => {
        const dataService = new DataService(mockDb);
        const updatedRow = {
            tags: ["updated"],
            banner_image: "updated.jpg",
            links: ["https://updated.com"],
            content: "Updated content",
            title: "Updated title",
        };
        const success = dataService.updateRow(1, updatedRow);
        expect(success).toBe(true);
    });

    test("deleteRow returns true for successful deletion", () => {
        const dataService = new DataService(mockDb);
        const success = dataService.deleteRow(1);
        expect(success).toBe(true);
    });
});
