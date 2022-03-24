// @ts-check

const esbuild = require("esbuild");
const { copySync, readFileSync, writeFileSync, rmSync } = require("fs-extra");

const { argv } = require("./argv");

const PRODUCTION_URL = "https://code.deth.net";
const DEVELOPMENT_URL = "https://localhost:5001";
const isProd = argv.production || process.env.CI === "true";

console.log("Is production build? ", isProd);

rmSync("./dist", { recursive: true, force: true });
copySync("./public", "./dist");

// Replace templates in index.html
let indexHtml = readFileSync("./dist/index.html", "utf8");
indexHtml = indexHtml.replace(
  "{{APPLICATION_URL}}",
  isProd ? PRODUCTION_URL : DEVELOPMENT_URL
);
writeFileSync("./dist/index.html", indexHtml, { encoding: "utf8" });

esbuild.build({
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.js",
  sourcemap: true,
});
