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
  globSync("src/**/*.*", { dot: true }).forEach((file) => {
    if (
      !file.endsWith("typescript.test.ts") &&
      (file.endsWith(".test.ts") || file.includes("src/test/"))
    )
      return;

    const destination = file.replace("src/", "vscode/");
    copySync(file, destination);
    copiedFilesReport += `${file} -> ${destination}\n`;
  });
  log.info(copiedFilesReport);

  /**
   * For some weird reason typecheck doesn't pass in these files. So we need to tweak them a bit.
   */
  log.info("============ Fixing types in extensions...");
  const files = [
    "extensions/css-language-features/server/src/browser/cssServerMain.ts",
    "extensions/html-language-features/server/src/browser/htmlServerMain.ts",
    "extensions/json-language-features/server/src/browser/jsonServerMain.ts",
    "extensions/markdown-language-features/server/src/browser/main.ts",
  ];
  files.forEach((file) => {
    changeFileSync(join(__dirname, "../vscode/", file), (content) =>
      content
        .replace(
          "const messageReader = new BrowserMessageReader(self);",
          "const messageReader = new BrowserMessageReader(self as any);"
        )
        .replace(
          "const messageWriter = new BrowserMessageWriter(self);",
          "const messageWriter = new BrowserMessageWriter(self as any);"
        )
    );
  });

  if (process.env.SKIP_COMPILE === "1") {
    return;
  }

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
