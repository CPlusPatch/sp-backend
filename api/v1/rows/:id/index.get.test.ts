import { describe, expect, test } from "bun:test";
import { fakeRequest } from "~/test/utils";
import { meta } from "./index.get";

describe(meta.route, () => {
    test("Should return a row by ID", async () => {
        const response = await fakeRequest(meta.route.replace(":id", "1"), {
            method: "GET",
        });

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toHaveProperty("id", "1");
    });

    test("Should return 404 Not Found if the row does not exist", async () => {
        const response = await fakeRequest(meta.route.replace(":id", "9999"), {
            method: "GET",
        });

        expect(response.status).toBe(404);

        const body = await response.json();

        expect(body).toHaveProperty("error", "Row not found");
    });
});
