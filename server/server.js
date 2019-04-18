// Error.stackTraceLimit = Infinity;

const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');

const app = loopback();

module.exports = app;

app.use(loopback.static(path.resolve(__dirname, '../client/build')));

app.start = () => app.listen(() => { // start the web server
  app.emit('started');
  console.log('Web server listening at: %s', app.get('url')); // eslint-disable-line no-console
});

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, (err) => {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.start();
  }
});
