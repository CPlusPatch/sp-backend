import { apiRoute, applyConfig, auth } from "@/api";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

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
        (context) => {
            const { id } = context.req.valid("param");

            const success = context.env.dataService.deleteRow(id);
            if (success) {
                return context.text("Row deleted successfully");
            }
            return context.json({ error: "Row not found" }, 404);
        },
    ),
);
