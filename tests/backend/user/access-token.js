const request = require('supertest');

const accessToken = request('http://localhost:3000')
  .post('/api/Users/login')
  .type('json')
  .send({ username: 'dlemper', password: 'test' })
  .expect(200)
  .then(token => token.body.id);

module.exports = accessToken;
