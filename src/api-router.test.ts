import type { Database } from "bun:sqlite";
import { describe, expect, mock, test } from "bun:test";
import { APIRouter } from "./api-router";
import { DataService } from "./data-service";

describe("APIRouter", () => {
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

    test("handleRequest - GET /api/v1/rows returns 200", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService);
        const request = new Request("http://localhost:3000/api/v1/rows", {
            method: "GET",
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    test("handleRequest - GET /api/rows/:id returns 404 for non-existent row", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService);
        const request = new Request("http://localhost:3000/api/rows/1", {
            method: "GET",
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(404);
    });

    test("handleRequest - Non-existent route returns 404", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService);
        const request = new Request("http://localhost:3000/api/nonexistent", {
            method: "GET",
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(404);
    });
});
