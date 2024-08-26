import type { IConfig } from "@/config";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { routes } from "~/routes";
import type { ApiRouteExports, Env } from "~/types/responses";
import { getDb } from "./drizzle/db";

export class APIRouter {
    private app: OpenAPIHono<Env>;
    private db: BunSQLiteDatabase;

    constructor(config: IConfig) {
        this.app = new OpenAPIHono<Env>();
        this.db = getDb(config.sqlite.database);

        this.app.use(cors());
        this.app.use(
            createMiddleware<Env>(async (c, next) => {
                c.set("config", config);
                c.set("database", this.db);
                await next();
            }),
        );
        this.app.doc31("/openapi.json", {
            openapi: "3.1.0",
            info: {
                title: "Sidepages API",
                version: "0.1.0",
            },
        });
        this.app.get("/docs", swaggerUI({ url: "/openapi.json" }));
    }

    public async registerRoutes() {
        // Apply routes
        for (const [, path] of Object.entries(routes)) {
            // use app.get(path, handler) to add routes
            const route: ApiRouteExports = await import(path);

            if (!(route.meta && route.default)) {
                throw new Error(
                    `Route ${path} does not have the correct exports.`,
                );
            }

            route.default(this.app);
        }
    }

    public handleRequest(request: Request): Promise<Response> {
        return Promise.resolve(this.app.fetch(request));
    }
}
