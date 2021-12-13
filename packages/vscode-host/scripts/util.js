// @ts-check

const process = require("process");
const child_process = require("child_process");
const fs = require("fs");
const fsExtra = require("fs-extra");
const glob = require("glob");
const rimraf = require("rimraf");
const path = require("path");
const { Logger } = require("tslog");

exports.existsSync = fs.existsSync;
exports.copyFileSync = fs.copyFileSync;
exports.writeFileSync = fs.writeFileSync;
exports.readFileSync = fs.readFileSync;
exports.mkdirSync = fs.mkdirSync;
exports.readdirSync = fs.readdirSync;
exports.statSync = fs.statSync;

exports.copySync = fsExtra.copySync;

exports.globSync = glob.sync;

/**
 * @param {string} path
 * @returns void
 */
exports.rimraf = (path) => rimraf.sync(path);

/**
 * @param  {...string} args
 * @returns void
 */
exports.chdir = (...args) => process.chdir(path.resolve(...args));

/**
 * @param {string | (string | boolean | undefined | null)[]} command
 * @param {Omit<import("child_process").ExecSyncOptions, 'encoding'>} options
 * @returns string
 */
exports.execSync = (command, options) => {
  if (Array.isArray(command)) {
    command = command.filter(Boolean).join(" ");
  }

  return child_process.execSync(command, {
    encoding: "utf8",
    ...options,
  });
};

/**
 * @param {string} filepath
 * @param {(contents: string) => string} change
 */
exports.changeFileSync = (filepath, change) => {
  const newContents = change(
    fs.readFileSync(filepath, { encoding: "utf8", flag: "r" })
  );
  fs.writeFileSync(filepath, newContents);
  return newContents;
};

exports.log = new Logger({
  displayFunctionName: false,
  displayDateTime: false,
});
