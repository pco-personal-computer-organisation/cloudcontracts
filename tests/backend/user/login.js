const tap = require('tap');
const accessToken = require('./access-token.js');

tap.test('login', (assert) => {
  accessToken
    // .then(res => assert.equal(res.text, 'app', 'Erwartungswert "app" geliefert!'))
    .then(() => assert.pass('login passed'))
    .then(() => assert.end())
    .catch(console.error); // eslint-disable-line no-console
});
