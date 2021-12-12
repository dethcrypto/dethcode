// @ts-check

const {
  chdir,
  writeFileSync,
  readFileSync,
  copyFileSync,
  existsSync,
  rimraf,
  execSync,
  mkdirSync,
  copySync,
} = require("./util");

function compileVSCode() {
  chdir(__dirname, "..");

  // Use simple workbench
  copyFileSync(
    "src/workbench.ts",
    "vscode/src/vs/code/browser/workbench/workbench.ts"
  );

  chdir("vscode");

  // Adapt compilation to web
  const gulpfilePath = "./build/gulpfile.vscode.js";
  const originalGulpfile = readFileSync("./build/gulpfile.vscode.js", {
    encoding: "utf8",
    flag: "r",
  });
  const changedGulpfile = originalGulpfile
    .replace(
      /vs\/workbench\/workbench.desktop.main/g,
      "vs/workbench/workbench.web.api"
    )
    .replace(
      /buildfile.workbenchDesktop/g,
      "buildfile.workbenchWeb,buildfile.keyboardMaps"
    );
  writeFileSync(gulpfilePath, changedGulpfile);

  // Compile
  execSync("yarn gulp compile-build", { stdio: "inherit" });
  execSync("yarn gulp minify-vscode", { stdio: "inherit" });
  execSync("yarn compile-web", { stdio: "inherit" });

  // It seems this is not needed:
  // // Remove maps
  // // const mapFiles = glob.sync("out-vscode-min/**/*.js.map", {});
  // // mapFiles.forEach((mapFile) => {
  // //   fs.unlinkSync(mapFile);
  // // });

  if (existsSync("../dist")) rimraf("../dist");
  mkdirSync("../dist");
  copySync("out-vscode-min", "../dist/vscode");
}

module.exports = { compileVSCode };

if (require.main === module) compileVSCode();
