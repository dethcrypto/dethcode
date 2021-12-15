const { compileVSCode } = require("./compileVSCode");
const { copyExtensions } = require("./copyExtensions");
const { copyPublic } = require("./copyPublic");

compileVSCode();
copyExtensions();
copyPublic();
