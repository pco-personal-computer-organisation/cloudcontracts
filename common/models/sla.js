const async = require('async');
const diff = require('deep-diff').diff;

const has = (o, k) => o.hasOwnProperty.call(o, k);
const uniq = array => [...new Set(array)];

/* eslint-disable no-param-reassign */

module.exports = (Sla) => {
  Sla.parameterList = (cb) => {
    Sla.find({
      fields: {
        name: true,
      },
      order: 'name ASC',
    },
    (err, slas) => {
      if (err) {
        console.log('error', err); // eslint-disable-line no-console
      }

      cb(null, uniq(slas.map(n => n.name)));
    });
  };

  Sla.remoteMethod('parameterList', {
    http: {
      path: '/parameterList',
      verb: 'get',
    },
    returns: {
      arg: 'names',
      type: ['String'],
      description: 'Namen',
    },
    description: 'Liefert alle im System bisher erfassten SLA-Parameter-Namen',
  });

  Sla.transformedHistoryCreate = (lhs, rhs, userId, cb) => {
    let difference = diff(lhs, rhs);

    if (difference) {
      difference = JSON.parse(JSON.stringify(difference));

      difference = difference.filter(n => n.path.includes('wert'));
      difference[0].path.length = 0;
      difference[0].path.push(lhs.name ? lhs.name : rhs.name);

      Sla.app.models.Historie.sanitizedCreate({
        idVertrag: has(rhs, 'idVertrag') ? rhs.idVertrag : lhs.idVertrag,
        changedmodel: 'SLA',
        diff: difference,
      }, userId, cb);
    } else {
      cb(null, null);
    }
  };

  Sla.createOrUpdate = (ctx, data, cb) => {
    const returnValues = [];

    async.each(data, (rhs, callback) => {
      if ('id' in rhs) {
        Sla.findById(rhs.id, (findErr, lhs) => {
          if (findErr) {
            callback(findErr);
            return;
          }

          Sla.updateAll({ id: rhs.id }, rhs, (updateErr) => {
            if (updateErr) {
              callback(updateErr);
              return;
            }

            Sla.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), JSON.parse(JSON.stringify(rhs)), ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
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
        Sla.create(rhs, (createErr, sla) => {
          if (createErr) {
            callback(createErr);
            return;
          }

          Sla.transformedHistoryCreate({}, JSON.parse(JSON.stringify(sla)), ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
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

  Sla.remoteMethod('createOrUpdate', {
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

  Sla.destroyMultipleById = (ctx, data, cb) => {
    let returnValue = 0;

    async.each(data, (item, callback) => {
      Sla.findById(item, (findErr, lhs) => { // TODO: check, why query.fk is used...
        if (findErr) {
          callback(findErr);
          return;
        }

        Sla.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), {}, ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
          if (historyErr) {
            callback(historyErr);
            return;
          }

          Sla.deleteById(item, (deleteErr, count) => {
            if (deleteErr) {
              callback(deleteErr);
              return;
            }

            returnValue += count;
            callback();
          });
        });
      });
    }, (err) => {
      cb(err, err ? null : returnValue);
    });
  };

  Sla.remoteMethod('destroyMultipleById', {
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

  Sla.beforeRemote('deleteById', (ctx, remoteMethodOutput, next) => {
    Sla.findById(ctx.req.query.fk ? ctx.req.query.fk : ctx.req.params.id, (findErr, lhs) => { // eslint-disable-line max-len, // TODO: check, why query.fk is used...
      if (findErr) {
        next(new Error(findErr));
        return;
      }

      Sla.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), {}, ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
        if (historyErr) {
          next(new Error(historyErr));
        } else {
          next();
        }
      });
    });
  });
};
