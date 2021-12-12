// @ts-check

const { argv } = require("./argv");
const {
  writeFileSync,
  chdir,
  readdirSync,
  statSync,
  readFileSync,
  globSync,
  existsSync,
  copySync,
} = require("./util");

function copyExtensions() {
  chdir(__dirname, "../vscode");

  const extensions = [
    // built-in extensions
  ];

  const extensionsNestedNodeModules = globSync("extensions/**/node_modules");
  copySync("extensions", "../dist/extensions", {
    filter: (src) => !src.includes("node_modules"),
  });

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
}

module.exports = { copyExtensions };

if (require.main === module) copyExtensions();
