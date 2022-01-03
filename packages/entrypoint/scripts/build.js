// @ts-check

const esbuild = require("esbuild");
const { copySync, readFileSync, writeFileSync, rmSync } = require("fs-extra");

const { argv } = require("./argv");

const PRODUCTION_URL = "https://ecv.deth.net";
const DEVELOPMENT_URL = "https://localhost:5001";

rmSync("./dist", { recursive: true, force: true });
copySync("./public", "./dist");

// Replace templates in index.html
let indexHtml = readFileSync("./dist/index.html", "utf8");
indexHtml = indexHtml.replace(
  "{{APPLICATION_URL}}",
  argv.production ? PRODUCTION_URL : DEVELOPMENT_URL
);
writeFileSync("./dist/index.html", indexHtml, { encoding: "utf8" });

esbuild.build({
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.js",
  sourcemap: true,
});
