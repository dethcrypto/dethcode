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
} = require("./util");

function copyExtensions() {
  chdir(__dirname, "../vscode");

  const extensions = [
    // our additional built-in extensions
    {
      extensionPath: "ethereum-viewer",
      packageJSON: require("../../ethereum-viewer/package.json"),
    },
  ];

  // copy our additional built-in extensions
  copySync(
    "../../ethereum-viewer/dist",
    "../dist/extensions/ethereum-viewer/dist"
  );
  copySync(
    "../../ethereum-viewer/package.json",
    "../dist/extensions/ethereum-viewer/package.json"
  );

  // copy default built-in extensions from VSCode repo
  copySync("extensions", "../dist/extensions", {
    filter: (src) => !src.includes("node_modules"),
  });

  // #region write extensions manifest
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
