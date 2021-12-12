// @ts-check

/**
 * @file
 * @usage node build.js [--verbose] [--production]
 */

const { prepareVSCode } = require("./prepareVSCode");
const { compileVSCode } = require("./compileVSCode");
const { copyExtensions } = require("./copyExtensions");
const { copyPublic } = require("./copyPublic");

prepareVSCode();
compileVSCode();
copyExtensions();
copyPublic();
