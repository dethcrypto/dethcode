// @ts-check

const { chdir, execSync, existsSync, log, rimraf } = require("./util");
const { argv } = require("./argv");

function prepareAdditionalExtensions() {
  log.info("Cloning additional built-in extensions...");

  chdir(__dirname, "../additional-extensions");

  const extensions = [
    {
      name: "solidity-lang",
      repo: "https://github.com/hasparus/vscode-solidity-extenstion.git",
      tag: "v1.3.0",
    },
  ];

  for (const ext of extensions) {
    if (argv.force) rimraf(`./${ext.name}`);

    if (existsSync(ext.name)) {
      log.info(
        `./additional-extensions/${ext.name} directory already exists — cloning skipped`
      );
    } else {
      execSync(
        `git clone --depth 1 --branch ${ext.tag} ${ext.repo} ${ext.name}`,
        { stdio: "inherit" }
      );
      execSync(["yarn --production", argv.verbose && "--verbose"], {
        stdio: "inherit",
        cwd: `./${ext.name}`,
      });
    }
  }
}

module.exports = { prepareAdditionalExtensions };

if (require.main === module) prepareAdditionalExtensions();
