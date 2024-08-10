import { $ } from "bun";
import ora from "ora";
import { routes } from "./routes";

const buildSpinner = ora("Building").start();

await $`rm -rf dist && mkdir dist`;

await Bun.build({
    entrypoints: ["src/index.ts", ...Object.values(routes)],
    outdir: "dist",
    target: "bun",
    splitting: true,
    minify: false,
}).then((output) => {
    if (!output.success) {
        process.exit(1);
    }
});

buildSpinner.succeed();
