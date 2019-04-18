module.exports = (app) => {
  if (process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev')) {
    console.log('DEVELOPMENT - webpack-dev-middleware'); // eslint-disable-line no-console
    const webpackDevMiddleware = require('webpack-dev-middleware'); // eslint-disable-line global-require, import/no-extraneous-dependencies
    const webpack = require('webpack'); // eslint-disable-line global-require, import/no-extraneous-dependencies
    const webpackConfig = require('./../../webpack.config.js'); // eslint-disable-line global-require, import/no-extraneous-dependencies

    app.use(webpackDevMiddleware(webpack(webpackConfig)));
  }

  app.all('/*', (req, res) => res.sendFile('index.html', { root: process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev') ? 'client/app' : 'client/build' }));
};
