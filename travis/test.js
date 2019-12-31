#!/usr/bin/env node

const { join } = require('path');
process.chdir(join(__dirname, '../projects/libraries/logger'));
require(join(__dirname, '../projects/libraries/logger/node_modules/mocha/bin/mocha'));
