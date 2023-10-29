// @ts-check

const { argv } = require("./argv");
const {
  writeFileSync,
  chdir,
  readdirSync,
  statSync,
  readFileSync,
  existsSync,
  copySync,
  log,
} = require("./util");

const { additionalExtensions } = require("./prepareAdditionalExtensions");

function copyExtensions() {
  log.info("============ Copying extensions to ./dist directory...");

  chdir(__dirname, "../vscode");

  // copy our additional built-in extensions
  log.info("Copying ethereum-viewer extension...");

  copySync(
    "../../ethereum-viewer/dist",
    "../dist/extensions/ethereum-viewer/dist"
  );
  copySync(
    "../../ethereum-viewer/package.json",
    "../dist/extensions/ethereum-viewer/package.json"
  );
  copySync(
    "../../ethereum-viewer/package.nls.json",
    "../dist/extensions/ethereum-viewer/package.nls.json"
  );

  const withoutNodeModules = { filter: (src) => !src.includes("node_modules") };

  log.info("Copying additional built-in extensions...");

  copySync(
    "../additional-extensions",
    "../dist/extensions",
    withoutNodeModules
  );

  // copy default built-in extensions from VSCode repo
  copySync("extensions", "../dist/extensions", withoutNodeModules);
}

module.exports = { copyExtensions };

if (require.main === module) copyExtensions();
