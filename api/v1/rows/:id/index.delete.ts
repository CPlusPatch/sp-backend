import { apiRoute, applyConfig, auth } from "@/api";
import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { dataRows } from "~/drizzle/schema";

export const meta = applyConfig({
    auth: {
        required: true,
    },
});

const schema = {
    param: z.object({
        id: z.string(),
    }),
};

export const openApiRoute = createRoute({
    method: "delete",
    path: "/api/v1/rows/{id}",
    middleware: [auth(meta.auth)],
    request: {
        params: schema.param,
    },
    responses: {
        200: {
            description: "Success",
            content: {
                "text/plain": {
                    schema: z.string(),
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

        await context
            .get("database")
            .delete(dataRows)
            .where(eq(dataRows.id, Number(id)));

        return context.text("Row deleted successfully", 200);
    }),
);
