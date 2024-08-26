import { apiRoute, applyConfig, auth } from "@/api";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { dataRows } from "~/drizzle/schema";
import type { Json } from "~/types/responses";

export const meta = applyConfig({
    allowedMethods: ["POST"],
    auth: {
        required: true,
    },
    route: "/api/v1/rows",
});

const schema = {
    body: z.object({
        tags: z.array(z.string()).default([]),
        title: z.string().min(1).optional(),
        image: z.string().url().optional(),
        links: z.array(z.string().url()).default([]),
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
        content: z.string().default(""),
    }),
};

export default apiRoute((app) =>
    app.on(
        meta.allowedMethods,
        meta.route,
        auth(meta.auth),
        zValidator("json", schema.body),
        async (context) => {
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
        },
    ),
);
