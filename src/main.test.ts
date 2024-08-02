import { describe, expect, test } from "bun:test";
import type { IConfig } from "./config";
import { Server } from "./main";

describe("Server", () => {
    test("initialization creates a Server instance", () => {
        const mockConfig: IConfig = {
            sqlite: { database: ":memory:" },
            http: { host: "localhost", port: 3000 },
            environment: "debug",
            logging: { level: "info" },
        };
        const server = new Server(mockConfig);
        expect(server).toBeInstanceOf(Server);
    });
});
