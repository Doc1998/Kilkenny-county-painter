const esbuild = require("esbuild");
const fs = require("node:fs/promises");
const server = require("../config/server");
const isProduction = server.isProduction;

module.exports = {
    outputFileExtension: "js",
    init: async function () {
        // Now properly awaited — Eleventy won't proceed until the dir exists
        await fs.mkdir('public/assets/js', { recursive: true });
    },
    compile: async (content, inputPath) => {
        if (!inputPath.includes("./src/assets/")) {
            return;
        }

        const result = await esbuild.build({
            entryPoints: [inputPath],
            outdir: "public/assets/js",
            write: false,
            bundle: true,
            minify: isProduction,
            sourcemap: !isProduction,
            target: isProduction ? "es6" : "esnext",
        });

        return async () => {
            // Write all files and wait for every one to actually finish
            await Promise.all(
                result.outputFiles.map(file => fs.writeFile(file.path, file.text))
            );
            return undefined;
        };
    }
};