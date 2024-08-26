import type { IConfig } from "@/config";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { routes } from "~/routes";
import type { ApiRouteExports, Env } from "~/types/responses";
import { getDb } from "./drizzle/db";

export class APIRouter {
    private app: Hono<Env>;
    private db: BunSQLiteDatabase;

    constructor(config: IConfig) {
        this.app = new Hono<Env>();
        this.db = getDb(config.sqlite.database);

        this.app.use(cors());
        this.app.use(
            createMiddleware<Env>(async (c, next) => {
                c.set("config", config);
                c.set("database", this.db);
                await next();
            }),
        );
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
