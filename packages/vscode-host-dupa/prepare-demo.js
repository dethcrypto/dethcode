var fs = require("fs");
const fse = require("fs-extra");
const child_process = require("child_process");

if (fs.existsSync("./demo/dist")) {
  fs.rmdirSync("./demo/dist", { recursive: true });
}

if (fs.existsSync("./demo/lib")) {
  fs.rmdirSync("./demo/lib", { recursive: true });
}

fse.copySync("./dist", "./demo/dist");
fse.copySync("./node_modules/semver-umd", "./demo/lib/semver-umd");
fse.copySync("./node_modules/vscode-oniguruma", "./demo/lib/vscode-oniguruma");
fse.copySync("./node_modules/vscode-textmate", "./demo/lib/vscode-textmate");

if(fs.existsSync('./demo/dist/extensions/vscode-web-playground')){
    fs.rmdirSync('./demo/dist/extensions/vscode-web-playground', { recursive: true })
}
child_process.execSync('git clone https://github.com/microsoft/vscode-web-playground.git  demo/dist/extensions/vscode-web-playground', {stdio: 'inherit'});
process.chdir('demo/dist/extensions/vscode-web-playground');
child_process.execSync('yarn', {stdio: 'inherit'});
child_process.execSync('yarn compile', {stdio: 'inherit'});

process.chdir('../../../..');

// if (fs.existsSync("./demo/dist/extensions.js")) {
//   fs.unlinkSync("./demo/dist/extensions.js");
// }

const packageJSON = fs.readFileSync(
  "./demo/dist/extensions/vscode-web-playground/package.json"
);
const extensions = [{ packageJSON: JSON.parse(packageJSON), extensionPath:  "vscode-web-playground"}]

const content = `var playground=${JSON.stringify(extensions)}`;

fs.writeFileSync("./demo/playground.js", content);
