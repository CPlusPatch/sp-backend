import { describe, expect, test } from "bun:test";
import { fakeRequest } from "~/test/utils";
import { meta } from "./index.get";

describe(meta.route, () => {
    test("Should return an array of rows", async () => {
        const response = await fakeRequest(meta.route);

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toBeArray();
    });
});
