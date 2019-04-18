const moment = require('moment');
const { diff } = require('deep-diff');
const async = require('async');

const has = (o, k) => o.hasOwnProperty.call(o, k);
const first = array => Array.from(array)[0];
const uniq = array => [...new Set(array)];

/* eslint-disable no-param-reassign */

module.exports = (Vertrag) => {
  // TODO: Feld 'vertragsart' oder 'art'?

  Vertrag.convertFieldFromDiff = (difference, fieldName, replacements, replacementField) => {
    const idx = difference.findIndex(n => n.path.includes(`${fieldName}`));

    if (!replacementField) {
      replacementField = 'name';
    }

    if (idx > -1) {
      if (has(difference[idx], 'lhs') && difference[idx].lhs && replacements.filter(n => n.id === difference[idx].lhs).length > 0) {
        difference[idx].lhs = first(replacements.filter(n => n.id === difference[idx].lhs))[replacementField]; // eslint-disable-line max-len
      }

      if (has(difference[idx], 'rhs') && difference[idx].rhs && replacements.filter(n => n.id === difference[idx].rhs).length > 0) {
        difference[idx].rhs = first(replacements.filter(n => n.id === difference[idx].rhs))[replacementField]; // eslint-disable-line max-len
      }
    }
  };

  Vertrag.transformedHistoryCreate = (lhs, rhs, userId, cb) => {
    let difference = diff(lhs, rhs);

    if (difference) {
      difference = JSON.parse(JSON.stringify(difference));

      Vertrag.app.models.Status.find()
        .then((status) => {
          Vertrag.convertFieldFromDiff(difference, 'idStatus', status);

          return Vertrag.app.models.Vertragspartner.find();
        })
        .then((vertragspartner) => {
          Vertrag.convertFieldFromDiff(difference, 'idVertragspartner', vertragspartner, 'firmenname');

          return Vertrag.app.models.Vertragsart.find();
        })
        .then((vertragsart) => {
          Vertrag.convertFieldFromDiff(difference, 'art', vertragsart);

          return Vertrag.app.models.Kategorien.find();
        })
        .then((kategorien) => {
          Vertrag.convertFieldFromDiff(difference, 'idKategorie', kategorien);

          return Vertrag.app.models.Kuendigungsoption.find();
        })
        .then((kuendigungsoptionen) => {
          Vertrag.convertFieldFromDiff(difference, 'idKuendigungsoption', kuendigungsoptionen);

          return Vertrag.app.models.User.find({ where: { idKunde: process.env.CUSTOMER_ID } });
        })
        .then((koordinatoren) => {
          Vertrag.convertFieldFromDiff(difference, 'idKoordinator', koordinatoren, 'email');

          return Vertrag.find();
        })
        .then((vertraege) => {
          Vertrag.convertFieldFromDiff(difference, 'idparent', vertraege, 'bezeichnung');
        })
        .then(() => {
          const fieldNameMap = {
            vertragsnr: 'Vertragsnummer',
            bezeichnung: 'Vertragsbezeichnung',
            idStatus: 'Status',
            idVertragspartner: 'Vertragspartner',
            art: 'Vertragsart',
            idKategorie: 'Vertragsgruppe',
            idKuendigungsoption: 'Kündigungsoption',
            idKoordinator: 'Koordinator',
            idparent: 'Übergeordneter Vertrag',
            rahmenvertragsnr: 'Rahmenvertragsnummer',
            ablageortoriginal: 'Ablageort Original',
            bemerkung: 'Bemerkung',
            laufzeitbeginn: 'Laufzeitbeginn',
            laufzeitende: 'Laufzeitende',
            mindestlaufzeit: 'Mindestlaufzeit',
            kuendigungsfrist: 'Kündigungsfrist',
            autoverlaengerung: 'Autom. Verlängerung',
            laufzeitverlaengerung: 'Laufzeit Verlängerung',
            vertragsstrafe: 'Vertragsstrafen',
            konto: 'Konto',
            kostenstelle: 'Kostenstelle',
            bestellnr: 'Bestellnummer',
            verantwortlicher: 'Verantwortlicher (KoSt)',
            organisationseinheit: 'Organisationseinheit',
            kuendigungsdatum: 'Kündigungsdatum',
          };

          Vertrag.app.models.Historie.sanitizedCreate({
            idVertrag: rhs.id,
            changedmodel: 'Vertrag',
            diff: difference.map((n) => {
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

  Vertrag.beforeRemote('upsert', (ctx, remoteMethodOutput, next) => {
    const rhs = ctx.req.body;

    if (has(rhs, 'id') && rhs.id > 0) {
      delete rhs.kosten;
      delete rhs.slas;
      delete rhs.dokumente;
      delete rhs.vertragsgegenstaende;
      delete rhs.vertragspartner;

      Vertrag.findById(rhs.id, (findErr, values) => {
        const lhs = JSON.parse(JSON.stringify(values));

        if (rhs.kuendigungsdatum !== lhs.kuendigungsdatum) { // TODO: move to better place?
          ctx.req.body.benachrichtigungCtr = 0;
        }

        Vertrag.transformedHistoryCreate(lhs, rhs, ctx.req.accessToken.userId, (historyErr) => {
          if (historyErr) {
            next(new Error(historyErr));
          } else {
            next();
          }
        });
      });
    } else {
      next();
    }
  });

  Vertrag.beforeRemote('prototype.updateAttributes', (ctx, remoteMethodOutput, next) => {
    const rhs = ctx.req.body;
    const lhs = JSON.parse(JSON.stringify(ctx.instance)); // unclutters object
    // do some cleanups first:
    delete rhs.slas;
    delete rhs.dokumente;
    delete rhs.vertragsgegenstaende;
    delete rhs.vertragspartner;

    if (rhs.kuendigungsdatum !== lhs.kuendigungsdatum) { // TODO: move to better place?
      ctx.req.body.benachrichtigungCtr = 0;
    }

    Vertrag.transformedHistoryCreate(lhs, rhs, ctx.req.accessToken.userId, (err) => {
      if (err) {
        next(new Error(err));
      } else {
        next();
      }
    });
  });

  Vertrag.ampel = (ctx, cb) => {
    const { User } = Vertrag.app.models;
    const isAfter = (date, days) => moment().add(days, 'days').isAfter(date);
    const colorVal = (date, arr) => arr.reduce((acc, n, idx) => (isAfter(date, n) ? idx + 1 : acc), 0); // eslint-disable-line max-len
    let benachrichtigungen;

    User.findById(ctx.req.accessToken.userId)
      .then((user) => {
        benachrichtigungen = [user.benachrichtigungsfrist1, user.benachrichtigungsfrist2, user.benachrichtigungsfrist3]; // eslint-disable-line max-len
        benachrichtigungen = [Math.max(...benachrichtigungen), Math.min(...benachrichtigungen)];
        return Promise.resolve(user);
      })
      .then(() => Vertrag.find({
        where: {
          kuendigungsdatum: {
            lt: moment().add(Math.max(...benachrichtigungen), 'days').toDate(),
          },
          idStatus: 1,
        },
        fields: {
          kuendigungsdatum: true,
        },
      }))
      .then(data => Promise.resolve(data.map((acc, n) => colorVal(n.kuendigungsdatum, benachrichtigungen)))) // eslint-disable-line max-len
      .then(data => cb(null, data.length > 0 ? Math.max(...data) : 0))
      .catch(cb);
  };

  Vertrag.remoteMethod('ampel', {
    http: {
      path: '/ampel',
      verb: 'get',
    },
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    returns: {
      arg: 'farbe',
      type: 'Number',
      description: 'Gruen(0) / Gelb(1) / Rot(2)',
    },
    description: 'Liefert eine Ampelfarbe in Abhaengigkeit von Vertragslaufzeiten und Kuendigungsfristen',
  });

  Vertrag.vertraegeKuendigung = (cb) => {
    Vertrag.find({
      include: [{
        relation: 'vertragspartner',
        scope: {
          fields: ['firmenname', 'mail'],
        },
      }, {
        relation: 'koordinator',
        scope: {
          fields: ['username', 'email'],
        },
      }, {
        relation: 'kosten',
        scope: {
          fields: ['kosten', 'datum'],
          include: ['waehrung', 'faelligkeit'],
        },
      }],
      fields: {
        id: true,
        bezeichnung: true,
        laufzeitbeginn: true,
        laufzeitende: true,
        kuendigungsdatum: true,
        kuendigungsfrist: true,
        idVertragspartner: true,
        idKoordinator: true,
      },
      where: {
        kuendigungsdatum: {
          lt: moment().add(90, 'days').toDate(),
        },
        idStatus: 1,
      },
      order: 'kuendigungsdatum ASC',
    }, cb);
  };

  Vertrag.remoteMethod('vertraegeKuendigung', {
    http: {
      path: '/vertraegeKuendigung',
      verb: 'get',
    },
    returns: {
      type: ['object'],
      root: true,
    },
  });

  Vertrag.vertraegeLaufzeit = (cb) => {
    Vertrag.find({
      include: [{
        relation: 'vertragspartner',
        scope: {
          fields: ['firmenname', 'mail'],
        },
      }, {
        relation: 'kosten',
        scope: {
          fields: ['kosten', 'datum'],
          include: ['waehrung', 'faelligkeit'],
        },
      }],
      fields: {
        id: true,
        bezeichnung: true,
        laufzeitbeginn: true,
        laufzeitende: true,
        idVertragspartner: true,
      },
      where: {
        laufzeitende: {
          lt: moment().add(90, 'days').toDate(),
        },
        idStatus: 1,
      },
      order: 'laufzeitende ASC',
    }, cb);
  };

  Vertrag.remoteMethod('vertraegeLaufzeit', {
    http: {
      path: '/vertraegeLaufzeit',
      verb: 'get',
    },
    returns: {
      type: ['object'],
      root: true,
    },
  });

  Vertrag.dashboardCount = (cb) => {
    Vertrag.count({
      and: [{
        or: [
          { kuendigungsdatum: { lt: moment().add(90, 'days').toDate() } },
          { laufzeitende: { lt: moment().add(90, 'days').toDate() } },
        ],
      },
      { idStatus: 1 }],
    }, cb);
  };

  Vertrag.remoteMethod('dashboardCount', {
    http: {
      path: '/dashboardCount',
      verb: 'get',
    },
    returns: {
      type: 'Number',
      arg: 'count',
    },
  });

  Vertrag.contractTree = (id, cb) => {
    Vertrag.find({
      fields: ['id', 'bezeichnung', 'idparent'],
    })
      .then((vertraege) => {
        let outlineContract = vertraege.find(n => n.id === id);

        // TODO: make it asynchronous.. somehow..
        const findChilds = (parent) => {
          parent.children = vertraege.filter(n => n.idparent === parent.id).map(findChilds);

          if (parent.children.length === 0) {
            delete parent.children;
          }

          return parent;
        };

        outlineContract = JSON.parse(JSON.stringify(findChilds(outlineContract)));

        const findParent = () => {
          if (outlineContract.idparent) {
            const parent = vertraege.find(n => n.id === outlineContract.idparent);
            parent.children = [outlineContract];
            outlineContract = parent;
            findParent(parent);
          }
        };
        findParent();

        cb(null, [outlineContract]);
      }, (err) => {
        console.error(err); // eslint-disable-line no-console
      });
  };

  Vertrag.remoteMethod('contractTree', {
    http: {
      path: '/:id/contractTree',
      verb: 'get',
    },
    accepts: [
      { arg: 'id', type: 'number', required: true },
    ],
    returns: {
      type: ['object'],
      root: true,
    },
  });

  Vertrag.kostenstelleList = (cb) => {
    Vertrag.find({
      fields: {
        kostenstelle: true,
      },
      order: 'kostenstelle ASC',
    })
      .then(kostenstellen => cb(null, uniq(kostenstellen.map(n => n.kostenstelle), true)))
      .catch(console.error); // eslint-disable-line no-console
  };

  Vertrag.remoteMethod('kostenstelleList', {
    http: {
      path: '/kostenstelleList',
      verb: 'get',
    },
    returns: {
      type: ['String'],
      root: true,
    },
  });

  Vertrag.beforeRemote('deleteById', (ctx, out, next) => {
    if (!ctx.req.params.id) {
      next(new Error('missing id!'));
      return;
    }

    Vertrag.app.models.Vertragsgegenstaende.find({ where: { idVertrag: ctx.req.params.id } })
      .then((gegenstaende) => {
        async.each(gegenstaende, (gegenstand, callback) => {
          Vertrag.app.models.AssetProperty.destroyAll({ idVertragsgegenstand: gegenstand.id }, callback); // eslint-disable-line max-len
        }, (err) => {
          if (err) {
            next(new Error(err));
          }
        });
      })
      .then(() => Vertrag.app.models.Vertragsgegenstaende.destroyAll({ idVertrag: ctx.req.params.id })) // eslint-disable-line max-len
      .then(() => Vertrag.app.models.Dokumente.destroyAll({ idVertrag: ctx.req.params.id }))
      .then(() => {
        Vertrag.app.models.DocumentStorage.getContainer(`${ctx.req.params.id}`, (err) => {
          if (!err) {
            Vertrag.app.models.DocumentStorage.destroyContainer(`${ctx.req.params.id}`);
          }
        });
      })
      .then(() => Vertrag.app.models.Kosten.destroyAll({ idVertrag: ctx.req.params.id }))
      .then(() => Vertrag.app.models.Sla.destroyAll({ idVertrag: ctx.req.params.id }))
      .then(() => Vertrag.app.models.Historie.destroyAll({ idVertrag: ctx.req.params.id }))
      .then(() => {
        next();
      })
      .catch((err) => {
        next(new Error(err));
      });
  });
};
