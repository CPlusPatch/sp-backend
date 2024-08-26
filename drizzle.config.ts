import type { Config } from "drizzle-kit";

export default {
    dialect: "sqlite",
    out: "./drizzle/migrations",
    schema: "./drizzle/schema.ts",
    // Print all statements
    verbose: true,
    // Always ask for confirmation
    strict: true,
} satisfies Config;
