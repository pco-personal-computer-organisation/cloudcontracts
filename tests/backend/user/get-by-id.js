const tap = require('tap');
const request = require('supertest');
const accessToken = require('./access-token');

tap.test('getById', (assert) => {
  accessToken
    .then(token => request('http://localhost:3000')
      .get('/api/Users/4')
      .set('Authorization', token)
      .expect(200))
    .then(res => assert.equal(res.body.username, 'dlemper', 'Erwartungswert "dlemper" geliefert!'))
    .then(() => assert.pass('get user passed'))
    .then(() => assert.end())
    .catch(console.error); // eslint-disable-line no-console
});
