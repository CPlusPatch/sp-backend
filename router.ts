import { Hono } from "hono";
import { cors } from "hono/cors";
import { routes } from "~/routes";
import type { ApiRouteExports } from "~/types/responses";
import type { DataService } from "./src/data-service";

export class APIRouter {
    private app: Hono;

    constructor(private dataService: DataService) {
        this.app = new Hono();

        // Enable CORS
        this.app.use(cors());
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
        return Promise.resolve(
            this.app.fetch(request, {
                dataService: this.dataService,
            }),
        );
    }
}
