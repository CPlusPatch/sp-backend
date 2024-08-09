import type { Hono, MiddlewareHandler } from "hono";
import type { ApiRouteMetadata } from "~/types/responses";
import type { DataService } from "./data-service";
import { Config } from "./config";

const config = await Config.load();

export const applyConfig = (config: ApiRouteMetadata) => config;

export const auth = (
    authConfig: ApiRouteMetadata["auth"],
): MiddlewareHandler => {
    return async (context, next) => {
        const authHeader = context.req.header("Authorization");
        if (
            authConfig.required &&
            authHeader !== `Bearer ${config.config.auth.token}`
        ) {
            return context.text("Unauthorized", 401);
        }
        await next();
    };
};

export const apiRoute = (
    fn: (
        app: Hono<{
            Bindings: {
                dataService: DataService;
            };
        }>,
    ) => void,
) => fn;
