const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV === 'production') {
  module.exports = JSON.parse(fs.readFileSync(path.resolve('config', 'datasources.json')));
}
