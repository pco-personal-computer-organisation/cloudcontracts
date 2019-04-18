const supertest = require('supertest');
const moment = require('moment');

const api = supertest('http://localhost:8080');

const describe = () => 'bla';
const it = () => 'bla';

describe('VERTRAG', () => {
  let token;
  const ninetyDays = moment(moment().add(90, 'days').toDate()).format();

  it('login as valid user to get an access token', (done) => {
    api
      .post('/api/Users/login')
      .send({ username: 'julges', password: 'test' })
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        token = `?access_token=${res.body.id}`;
        return done();
      });
  });

  describe('remote methods', () => {
    it('get api/Vertraege/ampel returns the color, subject to "Vertragslaufzeiten und Kuendigungsfristen"', (done) => {
      api
        .get(`/api/Vertraege/ampel${token}`)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          res.body.farbe.should.not.equal(null);
          res.body.farbe.should.within(0, 3);
          return done();
        });
    });

    it('get api/Vertraege/vertraegeLaufzeit returns an array of 5 contracts, which will end in 90 days or earlier', (done) => {
      api
        .get(`/api/Vertraege/vertraegeLaufzeit${token}`)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.not.equal(null);
          res.body.should.instanceof(Array);
          res.body.length.should.be.at.most(5);
          res.body.forEach(i => i.laufzeitende.should.most(ninetyDays));
          return done();
        });
    });

    it('get api/Vertraege/vertraegeKuendigung returns an array of 5 contracts, which should/could be canceled in 90 days or earlier', (done) => {
      api
        .get(`/api/Vertraege/vertraegeKuendigung${token}`)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.not.equal(null);
          res.body.should.be.a('array');
          res.body.length.should.be.at.most(5);
          res.body.forEach(i => i.laufzeitende.should.most(ninetyDays));
          return done();
        });
    });

    it('', (done) => {
      api
        .get(`/api/Vertraege/dashboardCount${token}`)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          console.log(res.body); // eslint-disable-line no-console
          return done();
        });
    });
  });
});
