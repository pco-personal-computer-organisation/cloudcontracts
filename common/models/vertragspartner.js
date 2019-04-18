/* eslint-disable no-param-reassign */

module.exports = (Vertragspartner) => {
  Vertragspartner.liste = (filter, cb) => {
    const where = Vertragspartner.dataSource.connector.buildWhere('Vertragspartner', filter.where);
    const orderBy = Vertragspartner.dataSource.connector.buildOrderBy('Vertragspartner', filter.order);

    Vertragspartner.dataSource.connector.execute(`select p.id, p.firmenname, p.kundennr, v.id AS idVertrag, v.bezeichnung, v.vertragsnr, v.laufzeitende, v.kuendigungsfrist from vertragspartner p left join vertrag v on p.id=v.idVertragspartner ${where.sql} ${orderBy};`, where.params, cb);
  };

  Vertragspartner.remoteMethod('liste', {
    http: {
      path: '/vertragspartner/liste',
      verb: 'GET',
    },
    accepts: {
      arg: 'filter',
      type: 'object',
      required: false,
    },
    returns: {
      type: ['object'],
      root: true,
    },
  });

  Vertragspartner.partnerFirmen = (cb) => {
    Vertragspartner.find({
      fields: ['id', 'firmenname', 'kundennr'],
      order: 'firmenname ASC',
    }, cb);
  };

  Vertragspartner.remoteMethod('partnerFirmen', {
    http: {
      path: '/partnerFirmen',
      verb: 'get',
    },
    returns: {
      arg: 'vertragspartner',
      type: ['object'],
      root: true,
    },
    description: 'Liste der Partnerfirmen',
  });
};
