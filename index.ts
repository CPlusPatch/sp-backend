import { Config } from "./src/config";
import { configureLoggers, logger } from "./src/logging";
import { Server } from "./src/main";

process.on("SIGINT", () => {
    process.exit();
});

process.on("uncaughtException", (err) => {
    logger.fatal`Uncaught exception: ${err}`;
    console.error(err);
    logger.fatal`Press Ctrl+C to exit`;

    // Hang until Ctrl+C is pressed
    Bun.sleepSync(Number.POSITIVE_INFINITY);
    process.exit(1);
});

// Start the server
await configureLoggers();

const config = await Config.load();
await configureLoggers(false, config.config);

const server = new Server(config.config);
await server.init();
server.start();
