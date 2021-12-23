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
  log.info("Copying extensions to ./dist directory...");

  chdir(__dirname, "../vscode");

  const extensions = [
    // main built-in extension, responsible for fetching and displaying contracts
    {
      extensionPath: "ethereum-viewer",
      packageJSON: require("../../ethereum-viewer/package.json"),
      packageNLS: null,
    },
    // additional built-in extensions, Solidity and Vyper language support
    ...additionalExtensions.map((ext) => ({
      extensionPath: ext.name,
      packageJSON: ext.getPackageJSON(),
      packageNLS: null,
    })),
  ];

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

  const withoutNodeModules = { filter: (src) => !src.includes("node_modules") };

  log.info("Copying additional built-in extensions...");

  copySync(
    "../additional-extensions",
    "../dist/extensions",
    withoutNodeModules
  );

  // copy default built-in extensions from VSCode repo
  copySync("extensions", "../dist/extensions", withoutNodeModules);

  // #region write extensions manifest
  log.info("Writing extensions manifest...");

  const extensionsDir = readdirSync("extensions");
  for (const extensionPath of extensionsDir) {
    const fullPath = `extensions/${extensionPath}`;

    if (!statSync(fullPath).isDirectory()) continue;

    const packagePath = `${fullPath}/package.json`;

    if (!existsSync(packagePath)) continue;

    const nlsPath = `${fullPath}/package.nls.json`;

    extensions.push({
      extensionPath,
      packageJSON: JSON.parse(readFileSync(packagePath, { encoding: "utf8" })),
      packageNLS: existsSync(nlsPath)
        ? JSON.parse(readFileSync(nlsPath, { encoding: "utf8" }))
        : null,
    });
  }

  writeFileSync(
    "../dist/extensions.json",
    JSON.stringify(extensions, null, argv.production ? null : 2)
  );
  // #endregion write extensions manifest
}

module.exports = { copyExtensions };

if (require.main === module) copyExtensions();
