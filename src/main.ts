import { serve } from "bun";
import chalk from "chalk";
import { APIRouter } from "../router";
import type { IConfig } from "./config";
import { logger } from "./logging";

/**
 * Main server class that initializes the database, data service, and API router.
 */
export class Server {
    public apiRouter: APIRouter;

    /**
     * Initializes the server with a database connection, data service, and API router.
     */
    constructor(private config: IConfig) {
        this.apiRouter = new APIRouter(config);
    }

    public async init(): Promise<void> {
        await this.apiRouter.registerRoutes();
    }

    /**
     * Starts the server and listens for incoming requests.
     */
    public start(): void {
        serve({
            port: this.config.http.port,
            hostname: this.config.http.host,
            fetch: (request: Request) => this.apiRouter.handleRequest(request),
        });
        logger.info`Server started at ${chalk.blue(`${this.config.http.host}:${this.config.http.port}`)}`;
    }
}
