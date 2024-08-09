import { apiRoute, applyConfig, auth } from "@/api";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

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
        title: z.string().optional(),
        banner_image: z.string().url().optional(),
        links: z.array(z.string().url()).optional(),
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
        (context) => {
            const { id } = context.req.valid("param");
            const data = context.req.valid("json");

            const success = context.env.dataService.updateRow(id, data);
            if (success) {
                return context.text("Row updated successfully");
            }
            return context.json({ error: "Row not found" }, 404);
        },
    ),
);
