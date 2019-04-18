const async = require('async');
const diff = require('deep-diff').diff;

const has = (o, k) => o.hasOwnProperty.call(o, k);
const uniq = array => [...new Set(array)];

/* eslint-disable no-param-reassign */

module.exports = (AssetProperty) => {
  AssetProperty.parameterList = (cb) => {
    AssetProperty.find({
      fields: {
        name: true,
      },
      order: 'name ASC',
    },
    (err, assetProperties) => {
      if (err) {
        console.error('error', err); // eslint-disable-line no-console
      }

      cb(null, uniq(assetProperties.map(n => n.name)));
    });
  };

  AssetProperty.remoteMethod('parameterList', {
    http: {
      path: '/parameterList',
      verb: 'get',
    },
    returns: {
      arg: 'names',
      type: ['String'],
      description: 'Namen',
    },
    description: 'Liefert alle im System bisher erfassten AssetProperty-Parameter-Namen',
  });

  AssetProperty.transformedHistoryCreate = (lhs, rhs, userId, cb) => {
    AssetProperty.app.models.Vertragsgegenstaende.findById(has(lhs, 'idVertragsgegenstand') ? lhs.idVertragsgegenstand : rhs.idVertragsgegenstand, (err, vertragsgegenstand) => {
      let difference = diff(lhs, rhs);

      if (difference) {
        difference = JSON.parse(JSON.stringify(difference));

        difference = difference.filter(n => n.path.includes('wert'));
        difference[0].path.length = 0;
        difference[0].path.push(lhs.name ? lhs.name : rhs.name);

        AssetProperty.app.models.Historie.sanitizedCreate({
          idVertrag: vertragsgegenstand.idVertrag,
          changedmodel: 'Vertragsassets',
          diff: difference,
        }, userId, cb);
      } else {
        cb(null, null);
      }
    });
  };

  AssetProperty.createOrUpdate = (ctx, data, cb) => {
    const returnValues = [];

    async.each(data, (rhs, callback) => {
      if ('id' in rhs) {
        AssetProperty.findById(rhs.id, (findErr, lhs) => {
          if (findErr) {
            callback(findErr);
            return;
          }

          AssetProperty.updateAll({ id: rhs.id }, rhs, (updateErr) => {
            if (updateErr) {
              callback(updateErr);
              return;
            }

            AssetProperty.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), JSON.parse(JSON.stringify(rhs)), ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
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
        AssetProperty.create(rhs, (createErr, assetprop) => {
          if (createErr) {
            callback(createErr);
            return;
          }

          AssetProperty.transformedHistoryCreate({}, JSON.parse(JSON.stringify(assetprop)), ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
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

  AssetProperty.remoteMethod('createOrUpdate', {
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

  AssetProperty.beforeRemote('upsert', (ctx, remoteMethodOutput, next) => {
    const rhs = JSON.parse(JSON.stringify(ctx.req.body));

    if (has(rhs, 'id')) {
      AssetProperty.findById(rhs.id, (findErr, lhs) => {
        if (findErr) {
          next(new Error(findErr));
          return;
        }

        AssetProperty.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), rhs, ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
          if (historyErr) {
            next(new Error(historyErr));
          } else {
            next();
          }
        });
      });
    } else {
      AssetProperty.transformedHistoryCreate({}, rhs, ctx.req.accessToken.userId, (err) => {
        if (err) {
          next(new Error(err));
        } else {
          next();
        }
      });
    }
  });

  AssetProperty.beforeRemote('deleteById', (ctx, remoteMethodOutput, next) => {
    AssetProperty.findById(ctx.req.query.fk ? ctx.req.query.fk : ctx.req.params.id, (findErr, lhs) => { // eslint-disable-line max-len
      if (findErr) {
        next(new Error(findErr));
        return;
      }

      AssetProperty.transformedHistoryCreate(JSON.parse(JSON.stringify(lhs)), {}, ctx.req.accessToken.userId, (historyErr) => { // eslint-disable-line max-len
        if (historyErr) {
          next(new Error(historyErr));
        } else {
          next();
        }
      });
    });
  });
};
