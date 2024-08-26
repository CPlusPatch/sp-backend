import { apiRoute, applyConfig, auth } from "@/api";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { dataRows } from "~/drizzle/schema";

export const meta = applyConfig({
    allowedMethods: ["DELETE"],
    auth: {
        required: true,
    },
    route: "/api/v1/rows/:id",
});

const schema = {
    param: z.object({
        id: z.string(),
    }),
};

export default apiRoute((app) =>
    app.on(
        meta.allowedMethods,
        meta.route,
        auth(meta.auth),
        zValidator("param", schema.param),
        async (context) => {
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

            return context.text("Row deleted successfully");
        },
    ),
);
