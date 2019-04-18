const fs = require('fs');
const path = require('path'); // eslint-disable-line import/newline-after-import
const app = require(path.resolve(__dirname, '../server/server')); // eslint-disable-line import/no-dynamic-require

const ds = app.dataSources.cm4it;

Object.keys(ds.connector._models).map((model) => { // eslint-disable-line no-underscore-dangle
  ds.models[model].settings.hidden = undefined;
  ds.models[model].find()
  .then((values) => {
    fs.writeFile(path.resolve(__dirname, '../testdata', `${model}.json`), JSON.stringify(values), (err) => {
      console.log(model, err); // eslint-disable-line no-console
    });
  });

  return model;
});
