import { apiRoute, applyConfig, auth } from "@/api";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const meta = applyConfig({
    allowedMethods: ["GET"],
    auth: {
        required: false,
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
        (context) => {
            const { id } = context.req.valid("param");

            const row = context.env.dataService.getRowById(id);
            if (row) {
                return context.json(row);
            }
            return context.json({ error: "Row not found" }, 404);
        },
    ),
);
