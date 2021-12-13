// @ts-check

const { chdir, execSync, existsSync, changeFileSync, log } = require("./util");
const { argv } = require("./argv");

const vscodeVersion = "1.58.0";

function prepareVSCode() {
  log.info("Cloning VSCode...");

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

  log.info("Installing VSCode dependencies...");

  changeFileSync("./build/npm/preinstall.js", (s) =>
    // This line in vscode/build/npm/preinstall.js checks what's the top-level
    // script runner, not what's used to install dependencies.
    // We're literally calling "yarn" few lines below from here.
    s.replace(
      `(!/yarn[\\w-.]*\\.js$|yarnpkg$/.test(process.env['npm_execpath']))`,
      "(false)"
    )
  );

  execSync(["yarn", argv.verbose && "--verbose"], { stdio: "inherit" });
}

module.exports = { prepareVSCode };

if (require.main === module) prepareVSCode();
