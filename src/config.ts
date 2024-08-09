import { loadConfig } from "c12";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { logger } from "./logging";

const ConfigSchema = z.object({
    environment: z.enum(["debug", "production"]).default("production"),
    http: z
        .object({
            port: z.number().int().min(1).max(65535).default(3000),
            host: z.string().default("0.0.0.0"),
        })
        .default({
            port: 3000,
            host: "0.0.0.0",
        }),
    auth: z.object({
        token: z.string(),
    }),
    logging: z
        .object({
            level: z
                .enum(["debug", "info", "warning", "error", "fatal"])
                .default("info"),
        })
        .default({
            level: "info",
        }),
    sqlite: z.object({
        database: z.string(),
    }),
});

export type IConfig = z.infer<typeof ConfigSchema>;

/**
 * The Config class represents the configuration of the server.
 */
export class Config {
    /**
     * Constructs a new Config instance.
     * @param {IConfig} config - The configuration object.
     */
    constructor(public config: IConfig) {}

    /**
     * Loads the configuration from the config file.
     * @returns {Promise<Config>} The loaded configuration.
     */
    static async load(): Promise<Config> {
        const { config } = await loadConfig<IConfig>({
            configFile: "config/config.toml",
        });

        const parsed = await ConfigSchema.safeParseAsync(config);

        if (!parsed.success) {
            const error = fromZodError(parsed.error);

            logger.fatal`Invalid configuration: ${error.message}`;
            logger.fatal`Press Ctrl+C to exit`;

            // Hang until Ctrl+C is pressed
            await Bun.sleep(Number.POSITIVE_INFINITY);
            process.exit(1);
        }

        return new Config(parsed.data);
    }
}
