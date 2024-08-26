import { apiRoute, applyConfig, auth } from "@/api";
import { dataRows } from "~/drizzle/schema";

export const meta = applyConfig({
    allowedMethods: ["GET"],
    auth: {
        required: false,
    },
    route: "/api/v1/rows",
});

export default apiRoute((app) =>
    app.on(
        meta.allowedMethods,
        meta.route,
        auth(meta.auth),
        async (context) => {
            const rows = await context.get("database").select().from(dataRows);
            return context.json(rows);
        },
    ),
);
