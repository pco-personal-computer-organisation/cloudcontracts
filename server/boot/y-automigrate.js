const fs = require('fs');
const path = require('path');
const async = require('async');

module.exports = (app) => {
  if (!process.env.NODE_ENV || !process.env.NODE_ENV.startsWith('dev')) { // automigrate models
    const createTableIfNotExists = (connector, model, cb) => {
      const sql = `CREATE TABLE IF NOT EXISTS ${connector.tableEscaped(model)} (\n  ${connector.buildColumnDefinitions(model)}\n)`;
      connector.execute(sql, cb);
    };

    const ds = app.dataSources.cm4it;
    async.each(Object.keys(ds.connector._models), (model, cb) => { // eslint-disable-line no-underscore-dangle, max-len
      createTableIfNotExists(ds.connector, model, (err) => {
        if (err) {
          console.log(model, err); // eslint-disable-line no-console
          cb(err);
          return;
        }

        ds.autoupdate(model, cb);
      });
    }, (err) => {
      if (err) {
        console.error(err); // eslint-disable-line no-console
      }
    });
  } else { // import testdata
    console.log('DEVELOPMENT - import testdata'); // eslint-disable-line no-console
    const { models } = app;

    Object.keys(models).map((model) => {
      const filepath = path.resolve(__dirname, '../../testdata', `${model}.js`);
      if (fs.existsSync(filepath)) {
        models[model].create(require(filepath), (err) => { // eslint-disable-line global-require, import/no-dynamic-require, max-len
          console.log(model, err); // eslint-disable-line no-console
        });
      }

      return model;
    });
  }
};
