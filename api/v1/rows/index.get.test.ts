import { describe, expect, test } from "bun:test";
import { fakeRequest } from "~/test/utils";
import { openApiRoute } from "./index.get";

describe(openApiRoute.getRoutingPath(), () => {
    test("Should return an array of rows", async () => {
        const response = await fakeRequest(openApiRoute.getRoutingPath());

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toBeArray();
    });
});
