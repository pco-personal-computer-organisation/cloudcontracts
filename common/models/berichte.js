const _ = require('lodash');
const Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);
require('moment-recur');
// const async = require('async');

/* eslint-disable no-param-reassign */

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const uniq = array => [...new Set(array)];

module.exports = (Berichte) => {
  Berichte.vertragsgegenstaende = (filter, cb) => {
    const { Vertragsgegenstaende } = Berichte.app.models;

    Vertragsgegenstaende.find({
      fields: ['bezeichnung', 'menge', 'idVertrag'],
      include: {
        relation: 'vertrag',
        scope: {
          fields: {
            bezeichnung: true,
          },
        },
      },
    })
      .then((vertragsgegenstaende) => {
        vertragsgegenstaende = JSON.parse(JSON.stringify(vertragsgegenstaende))
          .filter(g => has(g, 'vertrag') && has(g.vertrag, 'id'));

        const arr = vertragsgegenstaende
          .map(g => Object.assign({
            id: g.id,
            Gegenstand: g.bezeichnung,
            Vertrag: g.vertrag.bezeichnung,
            Summe: vertragsgegenstaende
              .filter(n => n.vertrag.id === g.vertrag.id && n.bezeichnung === g.bezeichnung)
              .reduce((acc, el) => acc + el.menge, 0),
            idVertrag: g.idVertrag,
          }))
          .reduce((acc, el) => (acc.find(n => n.Gegenstand === el.Gegenstand && n.Vertrag === el.Vertrag) ? acc : [...acc, el]), []) // eslint-disable-line max-len
          .sort((a, b) => (a.Gegenstand.localeCompare(b.Gegenstand, undefined, { numeric: true }) === 0 ? a.Vertrag.localeCompare(b.Vertrag, undefined, { numeric: true }) : a.Gegenstand.localeCompare(b.Gegenstand, undefined, { numeric: true })));

        /*Berichte.dataSource.connector.execute('select g.Bezeichnung as Gegenstand, v.Bezeichnung as Vertrag, SUM(g.Menge) as Summe, g.idVertrag from vertragsgegenstaende g join vertrag v on g.idVertrag = v.id group by v.id, g.Bezeichnung ORDER BY g.Bezeichnung;', undefined, (err, assets) => {
          console.log('compare', arr === assets, arr == assets);
        });*/

        cb(null, uniq(arr));
      })
      .catch(console.error);
  };

  Berichte.remoteMethod('vertragsgegenstaende', {
    http: {
      path: '/vertragsgegenstaende',
      verb: 'GET',
    },
    accepts: {
      arg: 'filter',
      type: 'object',
      required: false,
    },
    returns: {
      root: true,
      type: ['object'],
      description: 'Vertragsgegenstaende mit deren zugehoerigen Vertraegen',
    },
    description: 'Liefert eine Liste aller Vertragsgegenstaende mit den zugehoerigen Vertraegen und Anzahlen je Vertrag',
  });

  Berichte.settings.acls.push({
    property: 'vertragsgegenstaende',
    accessType: 'READ',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: '$authenticated',
  });

  Berichte.monatlicheKosten = (filter, cb) => {
    let toDate;
    let fromDate;

    if (has(filter, 'where')) {
      if (has(filter.where, 'startDate')) {
        fromDate = moment(filter.where.startDate);
      }

      if (has(filter.where, 'endDate')) {
        toDate = moment(filter.where.endDate);
      }
    }

    if (!fromDate.isValid() || !toDate.isValid()) {
      cb(null, []);
      return;
    }

    if (!toDate) {
      toDate = moment().endOf('month');
    }

    if (!fromDate) {
      fromDate = moment(toDate).subtract(11, 'months').startOf('month');
    }

    const range = moment.range(fromDate, toDate);

    Berichte.app.models.Kosten.find({
      include: ['waehrung', {
        relation: 'vertrag',
        scope: {
          fields: ['id', 'bezeichnung', 'art', 'idKategorie', 'idVertragspartner', 'idStatus'],
          include: {
            relation: 'vertragspartner',
            scope: {
              fields: ['id', 'firmenname'],
            },
          },
        },
      }],
    })
      .then((kosten) => {
        const data = [];
        kosten = JSON.parse(JSON.stringify(kosten));

        if (has(filter, 'where')) {
          if (has(filter.where, 'status') && filter.where.status) {
            kosten = kosten.filter(k => k.vertrag.idStatus === filter.where.status);
          }
          if (has(filter.where, 'art') && filter.where.art) {
            kosten = kosten.filter(k => k.vertrag.art === filter.where.art);
          }
          if (has(filter.where, 'idKategorie') && filter.where.idKategorie) {
            kosten = kosten.filter(k => k.vertrag.idKategorie === filter.where.idKategorie);
          }
          if (has(filter.where, 'vertragspartner')) {
            kosten = kosten.filter(k => k.vertrag.vertragspartner.id === filter.where.vertragspartner); // eslint-disable-line max-len
          }
        }

        kosten.map((item) => {
          if (moment(item.datum) > toDate) {
            return null;
          }

          let recurring = [];

          switch (item.idFaelligkeit) {
            case 9: // einmalig
              recurring.push(moment(item.datum));
              break;
            case 10: // monatlich
              recurring = moment(item.datum)
                .recur(toDate)
                .every(1)
                .months()
                .all();
              break;
            case 11: // vierteljährlich
              recurring = moment(item.datum)
                .recur(toDate)
                .every(3)
                .months()
                .all();
              break;
            case 12: // halbjährlich
              recurring = moment(item.datum)
                .recur(toDate)
                .every(6)
                .months()
                .all();
              break;
            case 13: // jährlich
              recurring = moment(item.datum)
                .recur(toDate)
                .every(12)
                .months()
                .all();
              break;
            default:
              console.error('unknown faelligkeit', item.idFaelligkeit); // eslint-disable-line no-console
              return 'unknown faelligkeit';
          }

          recurring.filter(recurItem => recurItem.within(range))
            .forEach((i) => {
              data.push({
                kosten: item.kosten,
                waehrung: item.waehrung.name,
                datum: i.toDate(),
                vertrag: item.vertrag.bezeichnung,
                vertragspartner: item.vertrag.vertragspartner.firmenname,
                art: item.vertrag.art,
                idKategorie: item.vertrag.idKategorie,
              });
            });

          return item;
        });

        return Promise.all(data.map(item => Berichte.app.models.Waehrung.currencyConversion(item.datum, item.kosten, item.waehrung, 'EUR')
          .then((value) => {
            item.kosten = value;
            item.waehrung = 'EUR';
            return item;
          })));
      })
      .then((kosten) => {
        kosten = _.groupBy(kosten, 'vertragspartner');

        kosten = _.transform(kosten, (result, n, key) => {
          const data = {};
          const months = fromDate.recur(toDate).every(1).months().all();

          data.sum = 0;

          months.forEach((month) => {
            data[month.format('YYYY-MM')] = 0;
          });

          n.forEach((item) => {
            data[moment(item.datum).format('YYYY-MM')] = (data[moment(item.datum).format('YYYY-MM')] || 0) + item.kosten;
            data.sum += item.kosten;
          });

          result[key] = data;
        });

        kosten = _.map(kosten, (item, key) => {
          const { sum } = item;
          delete item.sum;

          return {
            vertragspartner: key,
            data: item,
            summe: sum,
          };
        });

        cb(null, kosten);
      })
      .catch((err) => {
        cb(err);
      });
  };

  Berichte.remoteMethod('monatlicheKosten', {
    http: {
      path: '/monatlichekosten',
      verb: 'GET',
    },
    accepts: {
      arg: 'filter',
      type: 'object',
      required: false,
    },
    returns: {
      root: true,
      type: ['object'],
    },
  });

  Berichte.settings.acls.push({
    property: 'monatlicheKosten',
    accessType: 'READ',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: '$authenticated',
  });
};
