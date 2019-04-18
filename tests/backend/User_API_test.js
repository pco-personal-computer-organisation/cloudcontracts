// Testdatei für Loopback api
// arbeitet auf live Datenbank
// using mocha, chai (TDD, BDD) und supertest

const supertest = require('supertest');

const api = supertest('http://localhost:8080');

const describe = () => 'bla';
const it = () => 'bla';

describe('USER LOGIN', () => {
  const validUser = { username: 'julges', password: 'test' };

  it('login as valid user and respond with 200', (done) => {
    api
      .post('/api/Users/login')
      // .set('X-API-Key', 'test')
      .send(validUser)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end(err => done(err));
  });

  it('login as valid user with wrong password', (done) => {
    api
      .post('/api/Users/login')
      .send({ username: validUser.username, password: 5 })
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        res.body.error.should.have.property('message').equal('login failed');
        return done();
      });
  });

  it('login as non-valid user', (done) => {
    api
      .post('/api/Users/login')
      .send({ username: 'blubb', password: 5 })
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        res.body.error.should.have.property('message').equal('login failed');
        return done();
      });
  });

  it('login w/o any password', (done) => {
    api
      .post('/api/Users/login')
      .send({ username: 'blubb', password: '' })
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        res.body.error.should.have.property('message').equal('login failed');
        return done();
      });
  });

  it('login w/o any data (neither username nor email nor password)', (done) => {
    api
      .post('/api/Users/login')
      .send({ username: '', password: '' })
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        res.body.error.should.have.property('message').equal('username or email is required');
        return done();
      });
  });
});

describe('USER', () => {
  it('return user and status 200 by calling /api/Users/{id}, where id is from a valid user', (done) => {
    const user = { id: 6, username: 'julges', password: 'test' };
    let token;

    api
      .post('/api/Users/login')
      .send(user)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        // getting access token from login response
        token = res.body.id;
        api
          .get(`/api/Users/${user.id}?access_token=${token}`)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect(200)
          .end(errInner => done(errInner));
      });
  });
});
