import type { Hono } from "hono";
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
    allowedMethods: HttpVerb[];
    route: string;
    auth: {
        required: boolean;
        methodOverrides?: {
            [Key in HttpVerb]?: boolean;
        };
        oauthPermissions?: string[];
    };
    challenge?: {
        required: boolean;
        methodOverrides?: {
            [Key in HttpVerb]?: boolean;
        };
    };
}

export interface ApiRouteExports {
    meta: ApiRouteMetadata;
    /* schemas?: {
        query?: z.AnyZodObject;
        body?: z.AnyZodObject;
    }; */
    default: (app: Hono) => RouterRoute;
}
