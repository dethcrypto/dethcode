// @ts-check

/**
 * @file
 * @usage node build.js [--verbose] [--production]
 */

// Step 1
const { prepareVSCode } = require("./prepareVSCode");

prepareVSCode();

// Step 2: These can interchange
const { compileVSCode } = require("./compileVSCode");
const {
  prepareAdditionalExtensions,
} = require("./prepareAdditionalExtensions");

compileVSCode();
prepareAdditionalExtensions();

// Step 3
const { copyExtensions } = require("./copyExtensions");
const { copyPublic } = require("./copyPublic");

copyExtensions();
copyPublic();
