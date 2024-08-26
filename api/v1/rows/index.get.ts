import { apiRoute, applyConfig, auth } from "@/api";
import { createRoute, z } from "@hono/zod-openapi";
import { dataRows } from "~/drizzle/schema";
import { FullDataRowSchema } from "~/types/schemas";

export const meta = applyConfig({
    auth: {
        required: false,
    },
});

export const openApiRoute = createRoute({
    method: "get",
    path: "/api/v1/rows",
    middleware: [auth(meta.auth)],
    responses: {
        200: {
            description: "Success",
            content: {
                "application/json": {
                    schema: z.array(FullDataRowSchema),
                },
            },
        },
    },
});

export default apiRoute((app) =>
    app.openapi(openApiRoute, async (context) => {
        const rows = await context.get("database").select().from(dataRows);
        return context.json(rows);
    }),
);
