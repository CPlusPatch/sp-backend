import type { Database } from "bun:sqlite";
import { describe, expect, mock, test } from "bun:test";
import { APIRouter } from "./api-router";
import type { IConfig } from "./config";
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

    const config = {
        auth: {
            token: "test",
        },
    } as unknown as IConfig;

    test("handleRequest - GET /api/v1/rows returns 200", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService, config);
        const request = new Request("http://localhost:3000/api/v1/rows", {
            method: "GET",
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe(
            "application/json; charset=UTF-8",
        );
    });

    test("handleRequest - GET /api/rows/:id returns 404 for non-existent row", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService, config);
        const request = new Request("http://localhost:3000/api/rows/1", {
            method: "GET",
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(404);
    });

    test("handleRequest - Non-existent route returns 404", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService, config);
        const request = new Request("http://localhost:3000/api/nonexistent", {
            method: "GET",
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(404);
    });

    test("handleRequest - POST /api/rows returns 201 for valid request", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService, config);
        const request = new Request("http://localhost:3000/api/rows", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer test",
            },
            body: JSON.stringify({ name: "test" }),
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(201);
        const responseBody = await response.json();
        expect(responseBody.id).toBe(1);
    });

    test("handleRequest - POST /api/rows returns 401 for unauthorized request", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService, config);
        const request = new Request("http://localhost:3000/api/rows", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: "test" }),
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(401);
    });

    test("handleRequest - PUT /api/rows/:id returns 200 for valid request", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService, config);
        const request = new Request("http://localhost:3000/api/rows/1", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer test",
            },
            body: JSON.stringify({ name: "updated" }),
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(200);
    });

    test("handleRequest - PUT /api/rows/:id returns 401 for unauthorized request", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService, config);
        const request = new Request("http://localhost:3000/api/rows/1", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: "updated" }),
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(401);
    });

    test("handleRequest - DELETE /api/rows/:id returns 200 for valid request", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService, config);
        const request = new Request("http://localhost:3000/api/rows/1", {
            method: "DELETE",
            headers: {
                Authorization: "Bearer test",
            },
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(200);
    });

    test("handleRequest - DELETE /api/rows/:id returns 401 for unauthorized request", async () => {
        const dataService = new DataService(mockDb);
        const apiRouter = new APIRouter(dataService, config);
        const request = new Request("http://localhost:3000/api/rows/1", {
            method: "DELETE",
        });
        const response = await apiRouter.handleRequest(request);
        expect(response.status).toBe(401);
    });
});
