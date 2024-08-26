import { apiRoute, applyConfig, auth } from "@/api";
import { createRoute } from "@hono/zod-openapi";
import { dataRows } from "~/drizzle/schema";
import { DataRowSchema, FullDataRowSchema } from "~/types/schemas";

export const meta = applyConfig({
    auth: {
        required: true,
    },
});

export const openApiRoute = createRoute({
    method: "post",
    path: "/api/v1/rows",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: DataRowSchema,
                },
            },
        },
    },
    middleware: [auth(meta.auth)],
    responses: {
        201: {
            description: "Created",
            content: {
                "application/json": {
                    schema: FullDataRowSchema,
                },
            },
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            error: {
                                type: "string",
                            },
                        },
                    },
                },
            },
        },
    },
});

export default apiRoute((app) =>
    app.openapi(openApiRoute, async (context) => {
        const data = context.req.valid("json");
        const output = (
            await context
                .get("database")
                .insert(dataRows)
                .values({
                    content: data.content,
                    data: data.data,
                    image: data.image,
                    links: data.links,
                    tags: data.tags,
                    title: data.title,
                })
                .returning()
        )[0];

        return context.json(output, 201);
    }),
);
