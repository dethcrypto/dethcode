// @ts-check

const { chdir, execSync, existsSync } = require("./util");
const { argv } = require("./argv");

const vscodeVersion = "1.58.0";

function prepareVSCode() {
  chdir(__dirname, "..");

  if (existsSync("vscode")) {
    console.log("./vscode directory already exists — cloning skipped");
  } else {
    execSync(
      `git clone --depth 1 --branch ${vscodeVersion} https://github.com/microsoft/vscode.git`,
      {
        stdio: "inherit",
      }
    );
  }

  chdir("vscode");

  console.log("installing dependencies...");

  execSync(["yarn", argv.verbose && "--verbose"], {
    stdio: "inherit",
  });
}

module.exports = { prepareVSCode };

if (require.main === module) prepareVSCode();
