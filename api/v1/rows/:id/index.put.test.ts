import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { config, fakeRequest } from "~/test/utils";
import { meta } from "./index.put";

let id: string;

beforeAll(async () => {
    const requestBody = {
        tags: ["tag1", "tag2"],
        title: "Title",
        image: "https://example.com/image.jpg",
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
    test("Should update an existing row and return success message", async () => {
        const requestBody = {
            tags: ["updatedTag1", "updatedTag2"],
            title: "Updated Title",
            image: "https://example.com/updated_image.jpg",
            links: ["https://example.com/updated"],
            content: "Updated content",
        };

        const response = await fakeRequest(`${meta.route.replace(":id", id)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.config.auth.token}`,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toContainKeys([
            "id",
            "tags",
            "title",
            "image",
            "links",
            "content",
        ]);
    });

    test("Should return 401 Unauthorized if no token is provided", async () => {
        const requestBody = {
            tags: ["updatedTag1", "updatedTag2"],
            title: "Updated Title",
            image: "https://example.com/updated_image.jpg",
            links: ["https://example.com/updated"],
            content: "Updated content",
        };

        const response = await fakeRequest(`${meta.route.replace(":id", id)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(401);
    });

    test("Should return 404 Not Found if the row does not exist", async () => {
        const requestBody = {
            tags: ["updatedTag1", "updatedTag2"],
            title: "Updated Title",
            image: "https://example.com/updated_image.jpg",
            links: ["https://example.com/updated"],
            content: "Updated content",
        };

        const response = await fakeRequest(
            `${meta.route.replace(":id", "9999")}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.config.auth.token}`,
                },
                body: JSON.stringify(requestBody),
            },
        );

        expect(response.status).toBe(404);

        const body = await response.json();

        expect(body).toHaveProperty("error", "Row not found");
    });

    test("Should return 400 Bad Request if the request body is invalid", async () => {
        const invalidRequestBody = {
            title: "Updated Title",
            image: "invalid_url", // Invalid URL
            links: ["invalid_url"], // Invalid URL
            content: "Updated content",
        };

        const response = await fakeRequest(`${meta.route.replace(":id", id)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.config.auth.token}`,
            },
            body: JSON.stringify(invalidRequestBody),
        });

        expect(response.status).toBe(400);
    });
});
