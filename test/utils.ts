import { Config } from "@/config";
import { configureLoggers } from "@/logging";
import { Server } from "@/main";

await configureLoggers();
export const config = await Config.load();
const server = new Server(config.config);
await server.init();

export const fakeRequest = (url: URL | string, init?: RequestInit) => {
    return server.apiRouter.handleRequest(
        new Request(new URL(url, "http://localhost"), init),
    );
};
