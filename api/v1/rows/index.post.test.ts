import { describe, expect, test } from "bun:test";
import { config, fakeRequest } from "~/test/utils";
import { meta } from "./index.post";

describe(meta.route, () => {
    test("Should create a new row and return its ID", async () => {
        const requestBody = {
            tags: ["tag1", "tag2"],
            title: "Test Title",
            banner_image: "https://example.com/image.jpg",
            links: ["https://example.com"],
            content: "Test content",
        };

        const response = await fakeRequest(meta.route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.config.auth.token}`,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);

        const body = await response.json();

        expect(body).toHaveProperty("id");
        expect(body.id).toBeNumber();
    });

    test("Should return 401 Unauthorized if no token is provided", async () => {
        const requestBody = {
            tags: ["tag1", "tag2"],
            title: "Test Title",
            banner_image: "https://example.com/image.jpg",
            links: ["https://example.com"],
            content: "Test content",
        };

        const response = await fakeRequest(meta.route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(401);
    });

    test("Should return 400 Bad Request if the request body is invalid", async () => {
        const invalidRequestBody = {
            title: "Test Title",
            banner_image: "invalid_url", // Invalid URL
            links: ["invalid_url"], // Invalid URL
            content: "Test content",
        };

        const response = await fakeRequest(meta.route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.config.auth.token}`,
            },
            body: JSON.stringify(invalidRequestBody),
        });

        expect(response.status).toBe(400);
    });
});
