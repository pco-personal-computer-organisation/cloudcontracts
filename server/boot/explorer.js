module.exports = function mountLoopBackExplorer(server) {
  let explorer;
  try {
    explorer = require('loopback-explorer'); // eslint-disable-line global-require, import/no-extraneous-dependencies
  } catch (err) {
    // Print the message only when the app was started via `server.listen()`.
    // Do not print any message when the project is used as a component.
    server.once('started', (baseUrl) => { // eslint-disable-line no-unused-vars
      console.log('Run `npm install loopback-explorer` to enable the LoopBack explorer'); // eslint-disable-line no-console
    });
    return;
  }

  const restApiRoot = server.get('restApiRoot');

  const explorerApp = explorer.routes(server, { basePath: restApiRoot, protocol: 'http' });
  server.use('/explorer', explorerApp);
  server.once('started', () => {
    const baseUrl = server.get('url').replace(/\/$/, '');
    // express 4.x (loopback 2.x) uses `mountpath`
    // express 3.x (loopback 1.x) uses `route`
    const explorerPath = explorerApp.mountpath || explorerApp.route;
    console.log('Browse your REST API at %s%s', baseUrl, explorerPath); // eslint-disable-line no-console
  });
};
