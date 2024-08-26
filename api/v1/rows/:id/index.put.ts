import { apiRoute, applyConfig, auth } from "@/api";
import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { dataRows } from "~/drizzle/schema";
import { DataRowSchema, FullDataRowSchema } from "~/types/schemas";

export const meta = applyConfig({
    auth: {
        required: true,
    },
});

const schema = {
    param: z.object({
        id: z.string(),
    }),
    body: DataRowSchema.partial(),
};

export const openApiRoute = createRoute({
    method: "put",
    path: "/api/v1/rows/{id}",
    middleware: [auth(meta.auth)],
    request: {
        params: schema.param,
        body: {
            content: {
                "application/json": {
                    schema: schema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Success",
            content: {
                "application/json": {
                    schema: FullDataRowSchema,
                },
            },
        },
        404: {
            description: "Row not found",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
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
        const { id } = context.req.valid("param");
        const data = context.req.valid("json");

        // Find row
        const row = await context
            .get("database")
            .select()
            .from(dataRows)
            .where(eq(dataRows.id, Number(id)))
            .limit(1);

        if (row.length === 0) {
            return context.json({ error: "Row not found" }, 404);
        }

        const output = await context
            .get("database")
            .update(dataRows)
            .set({
                content: data.content,
                data: data.data,
                image: data.image,
                links: data.links,
                tags: data.tags,
                title: data.title,
            })
            .where(eq(dataRows.id, Number(id)))
            .returning();

        return context.json(output[0], 200);
    }),
);
