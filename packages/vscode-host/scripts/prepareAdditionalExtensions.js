// @ts-check

const { chdir, execSync, existsSync, log, rimraf } = require("./util");
const { argv } = require("./argv");
const { writeFileSync } = require("fs");

const additionalExtensions = [
  {
    name: "solidity-extension",
    repo: "https://github.com/contractshark/vscode-solidity-extension.git",
    branchOrTag: "v1.6.0",
    getPackageJSON: () =>
      // @ts-ignore
      require("../additional-extensions/solidity-extension/package.json"),
  },
  {
    name: "vyper-syntax",
    repo: "https://github.com/tintinweb/vscode-vyper.git",
    branchOrTag: "v0.0.15",
    getPackageJSON: () =>
      // @ts-ignore
      require("../additional-extensions/vyper-syntax/package.json"),
  },
];

function prepareAdditionalExtensions() {
  log.info("============  Cloning additional built-in extensions...");

  chdir(__dirname, "../additional-extensions");

  for (const ext of additionalExtensions) {
    if (argv.force) rimraf(`./${ext.name}`);

    if (existsSync(ext.name)) {
      log.info(
        `./additional-extensions/${ext.name} directory already exists — cloning skipped`
      );
    } else {
      execSync(
        `git clone --depth 1 --branch ${ext.branchOrTag} ${ext.repo} ${ext.name}`,
        { stdio: "inherit" }
      );

      /** @type {import("child_process").ExecSyncOptions} */
      const options = { stdio: "inherit", cwd: `./${ext.name}` };

      const packageJSON = ext.getPackageJSON();
      if ("package-web" in packageJSON.scripts) {
        log.info(`Installing dependencies for ${ext.name}...`);
        execSync(["yarn", argv.verbose && "--verbose"], options);
        log.info(`Compiling ${ext.name}...`);
        execSync(["yarn package-web", argv.verbose && "--verbose"], options);
      } else {
        log.info(`Installing production dependencies for ${ext.name}...`);
        execSync(["yarn --production", argv.verbose && "--verbose"], options);
      }

      // create empty metadata file if doesnt exist so vscode doesnt complain
      if (!existsSync(`./${ext.name}/package.nls.json`)) {
        writeFileSync(
          `./${ext.name}/package.nls.json`,
          JSON.stringify({
            displayName: "Deth",
            description: "deth",
          }),
          "utf8"
        );
      }
    }
  }
}

module.exports = { prepareAdditionalExtensions, additionalExtensions };

if (require.main === module) prepareAdditionalExtensions();
