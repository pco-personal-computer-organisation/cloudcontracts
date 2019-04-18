'use strict'; // eslint-disable-line strict, lines-around-directive

const fs = require('fs');
const p = require('../package.json');
const path = require('path');

let config = {};

if (process.env.NODE_ENV === 'production') {
  config = JSON.parse(fs.readFileSync(path.resolve('config', 'config.json')));
}

config.version = p.version;

module.exports = config;
