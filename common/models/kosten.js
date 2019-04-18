const async = require('async');
const diff = require('deep-diff').diff;

const has = (o, k) => o.hasOwnProperty.call(o, k);
const first = array => Array.from(array)[0];

/* eslint-disable no-param-reassign */

module.exports = (Kosten) => {
  Kosten.convertFieldFromDiff = (difference, fieldName, replacements, replacementField) => {
    const idx = difference.findIndex(n => n.path.includes(`${fieldName}`));

    if (!replacementField) {
      replacementField = 'name';
    }

    if (idx > -1) {
      if (has(difference[idx], 'lhs') && difference[idx].lhs) {
        difference[idx].lhs = first(replacements.filter(n => n.id === difference[idx].lhs))[replacementField]; // eslint-disable-line max-len
      }

      if (has(difference[idx], 'rhs') && difference[idx].rhs) {
        difference[idx].rhs = first(replacements.filter(n => n.id === difference[idx].rhs))[replacementField]; // eslint-disable-line max-len
      }
    }
  };

  Kosten.transformedHistoryCreate = (lhs, rhs, userId, cb) => {
    if (has(lhs, 'waehrung')) {
      delete lhs.waehrung;
    }
    if (has(rhs, 'waehrung')) {
      delete rhs.waehrung;
    }
    if (has(lhs, 'faelligkeit')) {
      delete lhs.faelligkeit;
    }
    if (has(rhs, 'faelligkeit')) {
      delete rhs.faelligkeit;
    }

    let difference = diff(lhs, rhs);

    if (difference) {
      difference = JSON.parse(JSON.stringify(difference));

      Kosten.app.models.Waehrung.find()
      .then((waehrungen) => {
        Kosten.convertFieldFromDiff(difference, 'idWaehrung', waehrungen);

        return Kosten.app.models.Faelligkeit.find();
      })
      .then((faelligkeiten) => {
        Kosten.convertFieldFromDiff(difference, 'idFaelligkeit', faelligkeiten);
      })
      .then(() => {
        const fieldNameMap = {
          idFaelligkeit: 'Fälligkeit',
          idWaehrung: 'Währung',
          kosten: 'Kosten',
          datum: 'Datum',
        };

        Kosten.app.models.Historie.sanitizedCreate({
          idVertrag: has(rhs, 'idVertrag') ? rhs.idVertrag : lhs.idVertrag,
          changedmodel: 'Kosten',
          diff: difference.filter(n => !n.path.includes('id') && !n.path.includes('idVertrag') && !n.path.includes('datepicker')).map((n) => {
            n.path[0] = fieldNameMap[n.path[0]];
            return n;
          }),
        }, userId, cb);
      })
      .catch((err) => {
        cb(err);
      });
    } else {
      cb(null, null);
    }
  };

  Kosten.createOrUpdate = (ctx, data, cb) => {
    const returnValues = [];

    async.each(data, (rhs, callback) => {
      if ('id' in rhs) {
        Kosten.findById(rhs.id, { include: ['waehrung', 'faelligkeit'] }, (findErr, lhs) => {
          if (findErr) {
            callback(findErr);
            return;
          }

          Kosten.updateAll({ id: rhs.id }, rhs, (updateErr) => {
            if (updateErr) {
              callback(updateErr);
              return;
            }

            Kosten.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), JSON.parse(JSON.stringify(rhs)), ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
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
        Kosten.create(rhs, (createErr, kosten) => {
          if (createErr) {
            callback(createErr);
            return;
          }

          Kosten.transformedHistoryCreate({}, JSON.parse(JSON.stringify(kosten)), ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
            if (historyErr) {
              callback(historyErr);
              return;
            }

            returnValues.push(kosten);
            callback();
          });
        });
      }
    }, (err) => {
      cb(err, err ? null : returnValues);
    });
  };

  Kosten.remoteMethod('createOrUpdate', {
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

  Kosten.destroyMultipleById = (ctx, dataArr, cb) => {
    let returnValue = 0;

    async.each(dataArr, (data, callback) => {
      Kosten.findById(data, { include: ['waehrung', 'faelligkeit'] }, (findErr, lhs) => {
        if (findErr) {
          callback(findErr);
          return;
        }

        Kosten.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), {}, ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
          if (historyErr) {
            callback(historyErr);
            return;
          }

          Kosten.deleteById(data, (deleteErr, count) => {
            returnValue += count;
            callback(deleteErr);
          });
        });
      });
    }, (err) => {
      cb(err, err ? null : returnValue);
    });
  };

  Kosten.remoteMethod('destroyMultipleById', {
    http: {
      path: '/destroyMultipleById',
      verb: 'post',
    },
    accepts: [{
      arg: 'ctx',
      type: 'object',
      http: { source: 'context' },
    }, {
      arg: 'data',
      type: ['Number'],
      http: { source: 'body' },
    }],
    returns: {
      type: 'Number',
      arg: 'count',
    },
  });

  Kosten.beforeRemote('deleteById', (ctx, remoteMethodOutput, next) => {
    Kosten.findById(ctx.req.query.fk ? ctx.req.query.fk : ctx.req.params.id, { include: ['waehrung', 'faelligkeit'] }, (findErr, lhs) => { // TODO: check, why query.fk is used...
      if (findErr) {
        next(new Error(findErr));
        return;
      }

      Kosten.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), {}, ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
        if (historyErr) {
          next(new Error(historyErr));
        } else {
          next();
        }
      });
    });
  });
};
