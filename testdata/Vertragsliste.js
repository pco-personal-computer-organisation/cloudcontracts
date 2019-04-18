const Vertraege = require('./Vertrag');
const Status = require('./Status');
const Vertragspartner = require('./Vertragspartner');
const pick = require('./pick');

const vertragFields = ['id', 'idVertragspartner', 'idKategorie', 'vertragsnr', 'bezeichnung', 'status', 'laufzeitende', 'kuendigungsdatum', 'benachrichtigungsfrist2', 'benachrichtigungsfrist3', 'idStellvertreter', 'stellvertreterAktiv', 'vorname', 'nachname', 'benachrichtigung'];

module.exports = Vertraege.map((vertrag) => {
  const vertragspartner = Vertragspartner.filter(n => n.id === vertrag.idVertragspartner)[0];
  const status = Status.filter(n => n.id === vertrag.idStatus)[0];

  return Object.assign(pick(vertrag, vertragFields), {
    statusName: status.name,
    firmenname: vertragspartner.firmenname,
  });
});
