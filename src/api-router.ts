import { type Context, Hono, type HonoRequest } from "hono";
import { cors } from "hono/cors";
import type { IConfig } from "./config";
import type { DataService } from "./data-service";

export class APIRouter {
    private app: Hono;

    /**
     * Initializes the APIRouter with a DataService instance and configuration.
     * @param dataService - The DataService instance for database operations.
     * @param config - The configuration object containing the auth token.
     */
    constructor(
        private dataService: DataService,
        private readonly config: IConfig,
    ) {
        this.app = new Hono();

        // Enable CORS
        this.app.use(cors());

        this.app.get("/api/v1/rows", (c) => this.getAllRows(c));
        this.app.get("/api/rows/:id", (c) => this.getRowById(c));
        this.app.post("/api/rows", (c) => this.createRow(c));
        this.app.put("/api/rows/:id", (c) => this.updateRow(c));
        this.app.delete("/api/rows/:id", (c) => this.deleteRow(c));
    }

    /**
     * Handles incoming HTTP requests and routes them to the appropriate handler.
     * @param request - The incoming HTTP request.
     * @returns A Response object.
     */
    public handleRequest(request: Request): Promise<Response> {
        return Promise.resolve(this.app.fetch(request));
    }

    /**
     * Handles GET request for all rows.
     * @param c - The Hono context.
     * @returns A Response object containing all rows.
     */
    private getAllRows(c: Context): Response {
        const rows = this.dataService.getAllRows();
        return c.json(rows);
    }

    /**
     * Handles GET request for a single row by ID.
     * @param c - The Hono context.
     * @returns A Response object containing the requested row or a 404 if not found.
     */
    private getRowById(c: Context): Response {
        const id = Number.parseInt(c.req.param("id"));
        const row = this.dataService.getRowById(id);
        if (row) {
            return c.json(row);
        }
        return c.text("Row not found", 404);
    }

    /**
     * Handles POST request to create a new row.
     * @param c - The Hono context.
     * @returns A Response object containing the ID of the newly created row.
     */
    private async createRow(c: Context): Promise<Response> {
        if (!this.isAuthorized(c.req)) {
            return c.text("Unauthorized", 401);
        }
        const data = await c.req.json();
        const id = this.dataService.insertRow(data);
        return c.json({ id }, 201);
    }

    /**
     * Handles PUT request to update an existing row.
     * @param c - The Hono context.
     * @returns A Response object indicating success or failure.
     */
    private async updateRow(c: Context): Promise<Response> {
        if (!this.isAuthorized(c.req)) {
            return c.text("Unauthorized", 401);
        }
        const id = Number.parseInt(c.req.param("id"));
        const data = await c.req.json();
        const success = this.dataService.updateRow(id, data);
        if (success) {
            return c.text("Row updated successfully");
        }
        return c.text("Row not found", 404);
    }

    /**
     * Handles DELETE request to remove a row.
     * @param c - The Hono context.
     * @returns A Response object indicating success or failure.
     */
    private deleteRow(c: Context): Response {
        if (!this.isAuthorized(c.req)) {
            return c.text("Unauthorized", 401);
        }
        const id = Number.parseInt(c.req.param("id"));
        const success = this.dataService.deleteRow(id);
        if (success) {
            return c.text("Row deleted successfully");
        }
        return c.text("Row not found", 404);
    }

    /**
     * Checks if the request is authorized.
     * @param request - The incoming HTTP request.
     * @returns A boolean indicating if the request is authorized.
     */
    private isAuthorized(request: HonoRequest): boolean {
        const authHeader = request.header("Authorization");
        return authHeader === `Bearer ${this.config.auth.token}`;
    }
}
