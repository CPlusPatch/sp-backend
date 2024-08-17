import { apiRoute, applyConfig, auth } from "@/api";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

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
        title: z.string().min(1),
        banner_image: z.string().url().or(z.literal("")).default(""),
        links: z.array(z.string().url()).default([]),
        content: z.string().default(""),
    }),
};

export default apiRoute((app) =>
    app.on(
        meta.allowedMethods,
        meta.route,
        auth(meta.auth),
        zValidator("json", schema.body),
        (context) => {
            const data = context.req.valid("json");
            const id = context.env.dataService.insertRow(data);
            return context.json({ id }, 201);
        },
    ),
);
