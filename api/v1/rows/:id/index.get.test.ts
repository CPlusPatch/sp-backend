import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { config, fakeRequest } from "~/test/utils";
import { meta } from "./index.get";

let id: string;

beforeAll(async () => {
    const requestBody = {
        tags: ["tag1", "tag2"],
        title: "Title",
        banner_image: "https://example.com/image.jpg",
        links: ["https://example.com"],
        content: "Content",
    };

    const reponse = await fakeRequest("/api/v1/rows", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.config.auth.token}`,
        },
        body: JSON.stringify(requestBody),
    });

    expect(reponse.status).toBe(201);

    const body = await reponse.json();

    id = body.id;
});

afterAll(async () => {
    const response = await fakeRequest(`${meta.route.replace(":id", id)}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${config.config.auth.token}`,
        },
    });

    expect(response.status).toBe(200);
});

describe(meta.route, () => {
    test("Should return a row by ID", async () => {
        const response = await fakeRequest(meta.route.replace(":id", id), {
            method: "GET",
        });

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toHaveProperty("id", id);
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
