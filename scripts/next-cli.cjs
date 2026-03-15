const fs = require("fs");

const realCwd = fs.realpathSync.native(process.cwd());
process.chdir(realCwd);

const nextBin = require.resolve("next/dist/bin/next");

process.argv = [process.argv[0], nextBin, ...process.argv.slice(2)];
require(nextBin);

