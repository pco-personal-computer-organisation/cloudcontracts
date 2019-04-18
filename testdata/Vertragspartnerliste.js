const Vertraege = require('./Vertrag');
const Vertragspartner = require('./Vertragspartner');
const pick = require('./pick');

const vertragspartnerFields = ['id', 'kundennr', 'firmenname', 'vertragsnr', 'bezeichnung', 'status', 'laufzeitende', 'kuendigungsdatum', 'benachrichtigungsfrist2', 'benachrichtigungsfrist3', 'idStellvertreter', 'stellvertreterAktiv', 'vorname', 'nachname', 'benachrichtigung'];

module.exports = Vertragspartner.map((vertragspartner) => {
  const vertrag = Vertraege.filter(n => n.idVertragspartner === vertragspartner.id)[0];

  return Object.assign(pick(vertragspartner, vertragspartnerFields), {
    idVertrag: vertrag.id,
    bezeichnung: vertrag.bezeichnung,
    vertragsnr: vertrag.vertragsnr,
    laufzeitende: vertrag.laufzeitende,
    kuendigungsfrist: vertrag.kuendigungsfrist,
  });
});
