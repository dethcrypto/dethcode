const process = require("process");
const child_process = require("child_process");
const fs = require("fs");
const fse = require("fs-extra");
const glob = require("glob");
const rmdir = require("rimraf");

const vscodeVersion = "1.58.0";

if (!fs.existsSync("vscode")) {
  child_process.execSync("git clone https://github.com/microsoft/vscode.git", {
    stdio: "inherit",
  });
}
process.chdir("vscode");

child_process.execSync(`git checkout -q ${vscodeVersion}`, {
  stdio: "inherit",
});

child_process.execSync("yarn --verbose", { stdio: "inherit" });

// Use simple workbench
fs.copyFileSync(
  "../src/workbench.ts",
  "src/vs/code/browser/workbench/workbench.ts"
);

// Adapt compilation to web
const gulpfilePath = "./build/gulpfile.vscode.js";
let gulpfile = fs.readFileSync(gulpfilePath, { encoding: "utf8", flag: "r" });

gulpfile = gulpfile
  .replace(
    /vs\/workbench\/workbench.desktop.main/g,
    "vs/workbench/workbench.web.api"
  )
  .replace(
    /buildfile.workbenchDesktop/g,
    "buildfile.workbenchWeb,buildfile.keyboardMaps"
  );

fs.writeFileSync(gulpfilePath, gulpfile);

// Compile
child_process.execSync("yarn gulp compile-build", { stdio: "inherit" });
child_process.execSync("yarn gulp minify-vscode", { stdio: "inherit" });
child_process.execSync("yarn compile-web", { stdio: "inherit" });

// Remove maps
const mapFiles = glob.sync("out-vscode-min/**/*.js.map", {});
mapFiles.forEach((mapFile) => {
  fs.unlinkSync(mapFile);
});

// Extract compiled files
if (fs.existsSync("../dist")) {
  fs.rmdirSync("../dist", { recursive: true });
}
fs.mkdirSync("../dist");
fse.copySync("out-vscode-min", "../dist/vscode");

const extensionNM = glob.sync("extensions/**/node_modules", {});
extensionNM.forEach((modules) => {
  rmdir.sync(modules, { recursive: true });
});
fse.copySync("extensions", "../dist/extensions");

// Add built in extensions
const extensions = [];

const extensionsFolderPath = "extensions";
const extensionsContent = fs.readdirSync(extensionsFolderPath);
for (const extension of extensionsContent) {
  const extensionPath = `${extensionsFolderPath}/${extension}`;
  if (fs.statSync(extensionPath).isDirectory()) {
    const extensionPackagePath = `${extensionPath}/package.json`;
    const extensionPackageNLSPath = `${extensionPath}/package.nls.json`;

    if (!fs.existsSync(extensionPackagePath)) {
      continue;
    }

    const packageJSON = JSON.parse(fs.readFileSync(extensionPackagePath));
    let packageNLS = null;

    if (fs.existsSync(extensionPackageNLSPath)) {
      packageNLS = JSON.parse(fs.readFileSync(extensionPackageNLSPath));
    }

    extensions.push({
      packageJSON,
      extensionPath: extension,
      packageNLS,
    });
  }
}

console.log("Extensions:", extensions);

const extensionsVar =
  "var extensions =" + JSON.stringify(extensions, { space: "\t", quote: "" });

fs.writeFileSync("../dist/extensions.js", extensionsVar);
