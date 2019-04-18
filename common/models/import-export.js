const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

const convertContractFields = vertrag => ({
  Vertragsnummer: vertrag.vertragsnr,
  Vertragsbezeichnung: vertrag.bezeichnung,
  Vertragspartner: vertrag.vertragspartner.firmenname,
  Status: vertrag.status.name,
  Laufzeitbeginn: vertrag.laufzeitbeginn,
  Laufzeitende: vertrag.laufzeitende,
  Kuendigungsfrist: vertrag.kuendigungsfrist,
  Kuendigungsdatum: vertrag.kuendigungsdatum,
  Kuendigungsoption: vertrag.kuendigungsoption.name,
  Vertragsgruppe: vertrag.kategorie ? vertrag.kategorie.name : '',
  Vertragsart: vertrag.vertragsart && has(vertrag.vertragsart, 'name') ? vertrag.vertragsart.name : '',
  Bemerkung: vertrag.bemerkung,
  Rahmenvertragsnummer: vertrag.rahmenvertragsnr,
  AblageortOriginal: vertrag.ablageortoriginal,
  Mindestlaufzeit: vertrag.mindestlaufzeit,
  AutomatischeVerlaengerung: vertrag.autoverlaengerung,
  LaufzeitVerlaengerung: vertrag.laufzeitverlaengerung,
  Vertragsstrafen: vertrag.vertragsstrafe,
  AngelegtVon: vertrag.angelegtvon,
  Anlagedatum: vertrag.anlagedatum,
  Bestellnummer: vertrag.bestellnr,
  Kostenstelle: vertrag.kostenstelle,
  Konto: vertrag.konto,
  VerantwortlicherKoST: vertrag.verantwortlicher,
  Organisationseinheit: vertrag.organisationseinheit,
  Koordinator: vertrag.koordinator ? `${vertrag.koordinator.vorname} ${vertrag.koordinator.nachname}` : '',
});

/* eslint-disable no-param-reassign */

module.exports = (ImportExport) => {
  ImportExport.assets = (cb) => {
    const { Vertragsgegenstaende } = ImportExport.app.models;
    const convertProperties = props => props.reduce((acc, el) => Object.assign({}, acc, { [el.name]: el.wert }), {}); // eslint-disable-line max-len
    const convertItems = g => ({
      Nr: g.nummer,
      Bezeichnung: g.bezeichnung,
      Menge: g.menge,
    });

    Vertragsgegenstaende.find({
      include: [{
        vertrag: ['vertragspartner', 'status', 'kuendigungsoption', 'kategorie', 'vertragsart', 'koordinator'],
      },
      'assetproperties'],
    })
      .then((vertragsgegenstaende) => {
        vertragsgegenstaende = JSON.parse(JSON.stringify(vertragsgegenstaende))
          .filter(g => g && has(g, 'vertrag') && has(g.vertrag, 'id'))
          .map(g => Object.assign({}, convertContractFields(g.vertrag), convertItems(g), convertProperties(g.assetproperties))); // eslint-disable-line max-len

        cb(null, vertragsgegenstaende);
      })
      .catch(console.error); // eslint-disable-line no-console
  };

  ImportExport.remoteMethod('assets', {
    http: {
      path: '/assets',
      verb: 'GET',
    },
    returns: {
      root: true,
      type: ['object'],
      description: 'Vertragsgegenstaende mit deren zugehoerigen Vertraegen',
    },
    description: 'Liefert eine Liste aller Vertragsgegenstaende mit den zugehoerigen Vertraegen',
  });

  ImportExport.settings.acls.push({
    property: 'assets',
    accessType: 'READ',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: '$authenticated',
  });

  ImportExport.kosten = (cb) => {
    const { Kosten } = ImportExport.app.models;
    const convertKosten = k => ({
      Kosten: k.kosten,
      Waehrung: k.waehrung ? k.waehrung.name : '',
      Faelligkeit: k.faelligkeit ? k.faelligkeit.name : '',
      Datum: k.datum,
    });

    Kosten.find({
      include: [{
        vertrag: ['vertragspartner', 'status', 'kuendigungsoption', 'kategorie', 'vertragsart', 'koordinator'],
      },
      'faelligkeit', 'waehrung'],
    })
      .then((kosten) => {
        kosten = JSON.parse(JSON.stringify(kosten))
          .filter(k => k && has(k, 'vertrag') && has(k.vertrag, 'id'))
          .map(k => Object.assign({}, convertContractFields(k.vertrag), convertKosten(k))); // eslint-disable-line max-len

        cb(null, kosten);
      })
      .catch(console.error); // eslint-disable-line no-console
  };

  ImportExport.remoteMethod('kosten', {
    http: {
      path: '/kosten',
      verb: 'GET',
    },
    returns: {
      root: true,
      type: ['object'],
    },
  });

  ImportExport.settings.acls.push({
    property: 'kosten',
    accessType: 'READ',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: '$authenticated',
  });

  ImportExport.slas = (cb) => {
    const { Vertrag } = ImportExport.app.models;
    const convertProperties = props => props.reduce((acc, el) => Object.assign({}, acc, { [el.name]: el.wert }), {}); // eslint-disable-line max-len

    Vertrag.find({
      include: ['vertragspartner', 'status', 'kuendigungsoption', 'kategorie', 'vertragsart', 'koordinator', 'slas'],
    })
      .then((vertraege) => {
        vertraege = JSON.parse(JSON.stringify(vertraege))
          .filter(v => v && has(v, 'slas') && v.slas.length > 0)
          .map(v => Object.assign({}, convertContractFields(v), convertProperties(v.slas))); // eslint-disable-line max-len

        cb(null, vertraege);
      })
      .catch(console.error); // eslint-disable-line no-console
  };

  ImportExport.remoteMethod('slas', {
    http: {
      path: '/slas',
      verb: 'GET',
    },
    returns: {
      root: true,
      type: ['object'],
    },
  });

  ImportExport.settings.acls.push({
    property: 'slas',
    accessType: 'READ',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: '$authenticated',
  });

  ImportExport.vertraege = (cb) => {
    const { Vertrag } = ImportExport.app.models;

    Vertrag.find({
      include: ['vertragspartner', 'status', 'kuendigungsoption', 'kategorie', 'vertragsart', 'koordinator'],
    })
      .then((vertraege) => {
        vertraege = JSON.parse(JSON.stringify(vertraege))
          .map(v => convertContractFields(v)); // eslint-disable-line max-len

        cb(null, vertraege);
      })
      .catch(console.error); // eslint-disable-line no-console
  };

  ImportExport.remoteMethod('vertraege', {
    http: {
      path: '/vertraege',
      verb: 'GET',
    },
    returns: {
      root: true,
      type: ['object'],
    },
  });

  ImportExport.settings.acls.push({
    property: 'vertraege',
    accessType: 'READ',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: '$authenticated',
  });
};
