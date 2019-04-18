const diff = require('deep-diff').diff;
const async = require('async');

const has = (o, k) => o.hasOwnProperty.call(o, k);

/* eslint-disable no-param-reassign */

module.exports = (Vertragsgegenstaende) => {
  Vertragsgegenstaende.transformedHistoryCreate = (lhs, rhs, userId, cb) => {
    let difference = diff(lhs, rhs);

    if (difference) {
      difference = JSON.parse(JSON.stringify(difference));

      const fieldNameMap = {
        nummer: 'Nr.',
        bezeichnung: 'Bezeichnung',
        menge: 'Menge',
      };

      Vertragsgegenstaende.app.models.Historie.sanitizedCreate({
        idVertrag: has(rhs, 'idVertrag') ? rhs.idVertrag : lhs.idVertrag,
        changedmodel: 'Vertragsassets',
        diff: difference.filter(n => !n.path.includes('idVertrag')).map((n) => {
          n.path[0] = fieldNameMap[n.path[0]] || n.path[0];
          return n;
        }),
      }, userId, cb);
    } else {
      cb(null, null);
    }
  };

  Vertragsgegenstaende.createOrUpdate = (ctx, data, cb) => {
    const returnValues = [];

    async.each(data, (rhs, callback) => {
      if ('id' in rhs) {
        Vertragsgegenstaende.findById(rhs.id, (findErr, lhs) => {
          if (findErr) {
            callback(findErr);
            return;
          }

          Vertragsgegenstaende.updateAll({ id: rhs.id }, rhs, (updateErr) => {
            if (updateErr) {
              callback(updateErr);
              return;
            }

            Vertragsgegenstaende.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), JSON.parse(JSON.stringify(rhs)), ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
              if (historyErr) {
                callback(historyErr);
                return;
              }

              returnValues.push(rhs);
              callback();
            });
          });
        });
      } else {
        Vertragsgegenstaende.create(rhs, (createErr, gegenstand) => {
          if (createErr) {
            callback(createErr);
            return;
          }

          Vertragsgegenstaende.transformedHistoryCreate({}, JSON.parse(JSON.stringify(gegenstand)), ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
            if (historyErr) {
              callback(historyErr);
              return;
            }

            returnValues.push(rhs);
            callback();
          });
        });
      }
    }, (err) => {
      cb(err, err ? null : returnValues);
    });
  };

  Vertragsgegenstaende.remoteMethod('createOrUpdate', {
    http: {
      path: '/createOrUpdate',
      verb: 'post',
    },
    accepts: [{
      arg: 'ctx',
      type: 'object',
      http: { source: 'context' },
    }, {
      arg: 'data',
      type: ['Object'],
      http: { source: 'body' },
    }],
    returns: {
      type: ['Object'],
      arg: 'data',
      root: true,
    },
  });

  Vertragsgegenstaende.beforeRemote('upsert', (ctx, remoteMethodOutput, next) => {
    const rhs = JSON.parse(JSON.stringify(ctx.req.body));

    if (has(rhs, 'id')) {
      Vertragsgegenstaende.findById(rhs.id, (findErr, lhs) => {
        if (findErr) {
          next(new Error(findErr));
          return;
        }

        Vertragsgegenstaende.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), rhs, ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
          if (historyErr) {
            next(new Error(historyErr));
          } else {
            next();
          }
        });
      });
    } else {
      Vertragsgegenstaende.transformedHistoryCreate({}, rhs, ctx.req.accessToken.userId, (err) => {
        if (err) {
          next(new Error(err));
        } else {
          next();
        }
      });
    }
  });

  Vertragsgegenstaende.beforeRemote('deleteById', (ctx, remoteMethodOutput, next) => {
    Vertragsgegenstaende.findById(ctx.req.params.id, (findErr, lhs) => { // eslint-disable-line max-len
      if (findErr) {
        next(new Error(findErr));
        return;
      }

      Vertragsgegenstaende.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), {}, ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
        if (historyErr) {
          next(new Error(historyErr));
        } else {
          next();
        }
      });
    });
  });
};
