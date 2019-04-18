const tap = require('tap');
const request = require('supertest');
const accessToken = require('./access-token');

tap.test('changePasswordAdmin', (assert) => {
  accessToken
    .then(token => request('http://localhost:3000')
      .put('/api/Users/4/changePassword')
      .set('Authorization', token)
      .send({ id: 4, newPassword: 'test1' })
      .expect(200))
    .then(res => assert.equal(res.text, 'true', 'Erwartungswert "true" geliefert!'))
    .then(() => assert.pass('not able to change my password without the old one, good'))
    .then(() => assert.end())
    .catch(console.error); // eslint-disable-line no-console
});
