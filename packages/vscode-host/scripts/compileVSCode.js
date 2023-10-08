// @ts-check

const { join } = require("path");
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

  log.info("============ Compiling VSCode...");
  chdir("vscode");
  execSync("yarn gulp vscode-web-min", { stdio: "inherit" });

  log.info("============ Copying build artifacts...");
  copySync(
    join(__dirname, "../vscode-web/extensions"),
    join(__dirname, "../dist/extensions")
  );
  copySync(
    join(__dirname, "../vscode-web/node_modules"),
    join(__dirname, "../dist/node_modules")
  );
  copySync(
    join(__dirname, "../vscode-web/out"),
    join(__dirname, "../dist/out")
  );
}

module.exports = { compileVSCode };

if (require.main === module) compileVSCode();
