#!/usr/bin/env node

require = require('esm')(module)
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
require('../lib').handle(yargs(hideBin(process.argv)))