import { apiRoute, applyConfig, auth } from "@/api";

export const meta = applyConfig({
    allowedMethods: ["GET"],
    auth: {
        required: false,
    },
    route: "/api/v1/rows",
});

export default apiRoute((app) =>
    app.on(meta.allowedMethods, meta.route, auth(meta.auth), (context) => {
        const rows = context.env.dataService.getAllRows();
        return context.json(rows);
    }),
);
