#!/usr/bin/env node
/* eslint-disable no-global-assign */

require = require('esm')(module)
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
require('../lib').handle(yargs(hideBin(process.argv)))
