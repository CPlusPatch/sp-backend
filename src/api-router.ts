import type { DataService } from "./data-service";
import { logger } from "./logging";

/**
 * Router class for handling API requests.
 */
export class APIRouter {
    private dataService: DataService;

    /**
     * Initializes the APIRouter with a DataService instance.
     * @param dataService - The DataService instance for database operations.
     */
    constructor(dataService: DataService) {
        this.dataService = dataService;
    }

    /**
     * Handles incoming HTTP requests and routes them to the appropriate handler.
     * @param request - The incoming HTTP request.
     * @returns A Response object.
     */
    public handleRequest(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        logger.debug`Handling request: ${method} ${path}`;

        try {
            switch (true) {
                case path === "/api/v1/rows" && method === "GET":
                    return Promise.resolve(this.getAllRows());
                case path.match(/^\/api\/rows\/\d+$/) && method === "GET":
                    return Promise.resolve(this.getRowById(path));
                /* case path === "/api/rows" && method === "POST":
                    return this.createRow(request);
                case path.match(/^\/api\/rows\/\d+$/) && method === "PUT":
                    return this.updateRow(path, request);
                case path.match(/^\/api\/rows\/\d+$/) && method === "DELETE":
                    return Promise.resolve(this.deleteRow(path)); */
                default:
                    return Promise.resolve(
                        new Response("Not Found", {
                            status: 404,
                            headers: {
                                "Access-Control-Allow-Origin": "*",
                                "Access-Control-Allow-Methods":
                                    "GET, POST, PUT, DELETE",
                                "Access-Control-Allow-Headers": "Content-Type",
                            },
                        }),
                    );
            }
        } catch (error) {
            logger.error`Error handling request: ${error}`;
            return Promise.resolve(
                new Response("Internal Server Error", {
                    status: 500,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods":
                            "GET, POST, PUT, DELETE",
                        "Access-Control-Allow-Headers": "Content-Type",
                    },
                }),
            );
        }
    }

    /**
     * Handles GET request for all rows.
     * @returns A Response object containing all rows.
     */
    private getAllRows(): Response {
        const rows = this.dataService.getAllRows();
        return new Response(JSON.stringify(rows), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    /**
     * Handles GET request for a single row by ID.
     * @param path - The request path containing the row ID.
     * @returns A Response object containing the requested row or a 404 if not found.
     */
    private getRowById(path: string): Response {
        const id = Number.parseInt(path.split("/").pop() || "");
        const row = this.dataService.getRowById(id);
        if (row) {
            return new Response(JSON.stringify(row), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }
        return new Response("Row not found", {
            status: 404,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    /**
     * Handles POST request to create a new row.
     * @param request - The incoming HTTP request.
     * @returns A Response object containing the ID of the newly created row.
     */
    // @ts-expect-error Auth code not implemented yet, so API is read-only
    private async createRow(request: Request): Promise<Response> {
        const data = await request.json();
        const id = this.dataService.insertRow(data);
        return new Response(JSON.stringify({ id }), {
            status: 201,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    /**
     * Handles PUT request to update an existing row.
     * @param path - The request path containing the row ID.
     * @param request - The incoming HTTP request.
     * @returns A Response object indicating success or failure.
     */
    // @ts-expect-error Auth code not implemented yet, so API is read-only
    private async updateRow(path: string, request: Request): Promise<Response> {
        const id = Number.parseInt(path.split("/").pop() || "");
        const data = await request.json();
        const success = this.dataService.updateRow(id, data);
        if (success) {
            return new Response("Row updated successfully", {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }
        return new Response("Row not found", {
            status: 404,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    /**
     * Handles DELETE request to remove a row.
     * @param path - The request path containing the row ID.
     * @returns A Response object indicating success or failure.
     */
    // @ts-expect-error Auth code not implemented yet, so API is read-only
    private deleteRow(path: string): Response {
        const id = Number.parseInt(path.split("/").pop() || "");
        const success = this.dataService.deleteRow(id);
        if (success) {
            return new Response("Row deleted successfully", {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }
        return new Response("Row not found", {
            status: 404,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }
}
