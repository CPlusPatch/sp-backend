import { apiRoute, applyConfig, auth } from "@/api";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { dataRows } from "~/drizzle/schema";
import type { Json } from "~/types/responses";

export const meta = applyConfig({
    allowedMethods: ["PUT"],
    auth: {
        required: true,
    },
    route: "/api/v1/rows/:id",
});

const schema = {
    param: z.object({
        id: z.string(),
    }),
    body: z.object({
        tags: z.array(z.string()).optional(),
        title: z.string().min(1).optional(),
        banner_image: z.string().url().or(z.literal("")).optional(),
        links: z.array(z.string().url()).optional(),
        // Any JSON value
        data: z
            .unknown()
            .refine(
                (value) => {
                    try {
                        JSON.parse(value as string);
                        return true;
                    } catch {
                        return false;
                    }
                },
                { message: "Invalid JSON" },
            )
            .transform((value) => JSON.parse(value as string) as Json)
            .optional(),
        content: z.string().optional(),
    }),
};

export default apiRoute((app) =>
    app.on(
        meta.allowedMethods,
        meta.route,
        auth(meta.auth),
        zValidator("param", schema.param),
        zValidator("json", schema.body),
        async (context) => {
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
                    image: data.banner_image,
                    links: data.links,
                    tags: data.tags,
                    title: data.title,
                })
                .where(eq(dataRows.id, Number(id)))
                .returning();

            return context.json(output[0]);
        },
    ),
);
