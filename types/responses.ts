import type { IConfig } from "@/config";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { RouterRoute } from "hono/types";

export type Json =
    | string
    | number
    | boolean
    | null
    | undefined
    | Json[]
    | { [key: string]: Json };

export type HttpVerb = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";
export interface ApiRouteMetadata {
    auth: {
        required: boolean;
        methodOverrides?: {
            [Key in HttpVerb]?: boolean;
        };
        oauthPermissions?: string[];
    };
}

export type Env = {
    Variables: {
        database: BunSQLiteDatabase;
        config: IConfig;
    };
};

export interface ApiRouteExports {
    meta: ApiRouteMetadata;
    /* schemas?: {
        query?: z.AnyZodObject;
        body?: z.AnyZodObject;
    }; */
    default: (app: OpenAPIHono<Env>) => RouterRoute;
}
