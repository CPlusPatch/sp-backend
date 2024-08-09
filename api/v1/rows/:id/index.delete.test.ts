import { describe, expect, test } from "bun:test";
import { config, fakeRequest } from "~/test/utils";
import { meta } from "./index.delete";

describe(meta.route, () => {
    test("Should delete a row by ID and return success message", async () => {
        const response = await fakeRequest(meta.route.replace(":id", "1"), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${config.config.auth.token}`,
            },
        });

        expect(response.status).toBe(200);

        const body = await response.text();

        expect(body).toBe("Row deleted successfully");
    });

    test("Should return 401 Unauthorized if no token is provided", async () => {
        const response = await fakeRequest(meta.route.replace(":id", "1"), {
            method: "DELETE",
        });

        expect(response.status).toBe(401);
    });

    test("Should return 404 Not Found if the row does not exist", async () => {
        const response = await fakeRequest(meta.route.replace(":id", "9999"), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${config.config.auth.token}`,
            },
        });

        expect(response.status).toBe(404);

        const body = await response.json();

        expect(body).toHaveProperty("error", "Row not found");
    });
});
