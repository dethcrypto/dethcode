// @ts-check

const {
  chdir,
  log,
  existsSync,
  rimraf,
  execSync,
  mkdirSync,
  copySync,
  changeFileSync,
  globSync,
} = require("./util");

function compileVSCode() {
  log.info("Compiling VSCode...");

  chdir(__dirname, "..");

  // Use simple workbench
  let copiedFilesReport = "Copied files: \n";
  globSync("src/**/*.*").forEach((file) => {
    if (file.endsWith(".test.ts") || file.includes("src/test/")) return;

    const destination = file.replace("src/", "vscode/src/vs/");
    copySync(file, destination);
    copiedFilesReport += `${file} -> ${destination}\n`;
  });
  log.info(copiedFilesReport);

  chdir("vscode");

  // Adapt compilation to web
  changeFileSync("./build/gulpfile.vscode.js", (s) =>
    s
      .replace(
        /vs\/workbench\/workbench.desktop.main/g,
        "vs/workbench/workbench.web.api"
      )
      .replace(
        /buildfile.workbenchDesktop/g,
        "buildfile.workbenchWeb,buildfile.keyboardMaps"
      )
  );

  // Compile
  execSync("yarn gulp compile-build", { stdio: "inherit" });
  execSync("yarn gulp minify-vscode", { stdio: "inherit" });
  execSync("yarn compile-web", { stdio: "inherit" });

  if (existsSync("../dist")) rimraf("../dist");
  mkdirSync("../dist");
  copySync("out-vscode-min", "../dist/vscode");
}

module.exports = { compileVSCode };

if (require.main === module) compileVSCode();
