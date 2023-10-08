// @ts-check

const { chdir, execSync, existsSync, changeFileSync, log } = require("./util");
const { argv } = require("./argv");

const vscodeVersion = "1.82.0";

function prepareVSCode() {
  log.info("============ Cloning VSCode...");

  chdir(__dirname, "..");

  if (existsSync("vscode")) {
    log.info("./vscode directory already exists — cloning skipped");
  } else {
    execSync(
      `git clone --depth 1 --branch ${vscodeVersion} https://github.com/microsoft/vscode.git`,
      {
        stdio: "inherit",
      }
    );
  }

  chdir("vscode");

  log.info("============ Installing VSCode dependencies...");

  if (!existsSync("node_modules")) {
    execSync("yarn", { stdio: "inherit" });
  }
}

module.exports = { prepareVSCode };

if (require.main === module) prepareVSCode();
