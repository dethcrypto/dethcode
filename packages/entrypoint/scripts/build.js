// @ts-check

const esbuild = require("esbuild");
const { copySync, readFileSync, writeFileSync, rmSync } = require("fs-extra");

function getIFrameUrl() {
  const iframeTarget = process.env.DETH_IFRAME_URL;
  const isCI = process.env.CI === "true";

  if (!iframeTarget && isCI) {
    throw new Error("Missing DETH_IFRAME_URL environment variable");
  }
  return iframeTarget ?? "https://localhost:5001";
}

const iframeTarget = getIFrameUrl();

console.log("Building entrypoint...");
console.log("iframe target:", iframeTarget);

rmSync("./dist", { recursive: true, force: true });
copySync("./public", "./dist");

// Replace templates in index.html
let indexHtml = readFileSync("./dist/index.html", "utf8");
indexHtml = indexHtml.replace("{{APPLICATION_URL}}", iframeTarget);
writeFileSync("./dist/index.html", indexHtml, { encoding: "utf8" });

esbuild.build({
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.js",
  sourcemap: true,
});
