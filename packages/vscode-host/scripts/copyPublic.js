// @ts-check

const { chdir, existsSync, rimraf, copySync, log } = require("./util");

function copyPublic() {
  log.info("Copying assets from ./public to ./dist");

  chdir(__dirname, "..");

  if (existsSync("./dist/lib")) rimraf("./dist/lib");

  copySync("./node_modules/semver-umd", "./dist/lib/semver-umd");
  copySync("./node_modules/vscode-oniguruma", "./dist/lib/vscode-oniguruma");
  copySync("./node_modules/vscode-textmate", "./dist/lib/vscode-textmate");

  copySync("./public", "./dist", { recursive: true });
}

module.exports = { copyPublic };

if (require.main === module) copyPublic();
