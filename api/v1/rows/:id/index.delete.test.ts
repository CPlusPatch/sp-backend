import { describe, expect, test, beforeAll } from "bun:test";
import { config, fakeRequest } from "~/test/utils";
import { meta } from "./index.delete";

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

describe(meta.route, () => {
    test("Should delete a row by ID and return success message", async () => {
        const response = await fakeRequest(meta.route.replace(":id", id), {
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
        const response = await fakeRequest(meta.route.replace(":id", id), {
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
