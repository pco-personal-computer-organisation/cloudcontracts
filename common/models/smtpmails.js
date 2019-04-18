const Moment = require('moment');
const MomentRange = require('moment-range');
const http = require('http');
const url = require('url');

const moment = MomentRange.extendMoment(Moment);

const has = (obj, key) => obj.hasOwnProperty.call(obj, key);

const httpRequest = opts => new Promise((resolve, reject) => {
  const options = Object.assign({}, opts);
  options.headers = options.headers || {};
  options.method = options.method || 'GET';

  if ((options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') && options.body) {
    if (typeof options.body === 'string' || typeof options.body === 'number') {
      options.body = `${options.body}`; // convert number to string in case body is number
      options.headers['Content-Type'] = options.headers['Content-Type'] || 'text/plain';
    } else {
      options.body = JSON.stringify(options.body);
      options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    }

    options.headers['Content-Length'] = options.headers['Content-Length'] || Buffer.from(options.body).length;
  }

  const req = http.request(Object.assign(url.parse(options.url), options), (res) => {
    if (res.statusCode !== 200) {
      reject(res);
      return;
    }

    let data = '';

    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => resolve(data));
  });

  req.on('error', (e) => {
    reject(e);
  });

  if (options.headers['Content-Length'] > 0) {
    req.write(options.body);
  }
  req.end();
});

httpRequest.post = (address, body, options) => httpRequest(Object.assign({ method: 'POST', url: address, body }, options));

/* eslint-disable no-param-reassign */

module.exports = (SmtpMail) => {
  SmtpMail.bericht = (cb) => {
    const { User, Vertrag } = SmtpMail.app.models;
    // const SmtpRecipientGroup=SmtpMail.app.models.SmtpRecipientGroup;
    // const SmtpRecipient=SmtpMail.app.models.SmtpRecipient;

    let filter = {
      where: {
        idKunde: parseInt(process.env.CUSTOMER_ID, 10),
        benachrichtigung: 1,
      },
    };

    if (has(process.env, 'SMTP_TEST') && parseInt(process.env.SMTP_TEST, 10) === 1) {
      console.log('SMTP_TEST'); // eslint-disable-line no-console
      filter = { benachrichtigung: 1 };
    }

    User.find(filter, (userErr, users) => {
      users.forEach((user) => {
        if (user.status && user.status.includes('locked')) {
          console.log(moment().format(), 'user is locked, so no mail gets send:', user.id, user.email); // eslint-disable-line no-console
          return;
        }

        const benachrichtigungsfristen = [user.benachrichtigungsfrist1, user.benachrichtigungsfrist2, user.benachrichtigungsfrist3].sort(); // eslint-disable-line max-len

        Vertrag.find({
          include: 'vertragspartner',
          where: {
            kuendigungsdatum: {
              lt: moment().add(Math.max(...benachrichtigungsfristen), 'days').toDate(),
            },
            idStatus: 1,
            idKoordinator: user.id,
          },
          order: 'kuendigungsdatum ASC',
        }, (err, vertraege) => {
          if (vertraege === null || vertraege.length === 0) {
            return;
          }

          let text = `<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; width: 100%;">Sehr geehrte(r) ${user.vorname} ${user.nachname},</p><p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; width: 100%;">bei folgenden Vertr&auml;gen werden in K&uuml;rze die K&uuml;ndigungsfristen ablaufen oder sind bereits abgelaufen:</p><table style="border-collapse: collapse; background-color: transparent; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; width: 100%; box-sizing: border-box;"><thead><th style="text-align: left; padding: 8px; line-height: 1.42857; vertical-align: bottom; border-bottom: 2px solid #DDD; border-top: 0px none;">Vertrag</th><th style="text-align: left; padding: 8px; line-height: 1.42857; vertical-align: bottom; border-bottom: 2px solid #DDD; border-top: 0px none;">Vertragspartner</th><th style="text-align: left; padding: 8px; line-height: 1.42857; vertical-align: bottom; border-bottom: 2px solid #DDD; border-top: 0px none;">K&uuml;ndigungsfrist</th></thead><tbody>`;
          let sendmail = false;

          vertraege.forEach((vertrag) => {
            if (user.id !== vertrag.idKoordinator) {
              console.error('uhoh.. SmtpMail fails by sending mail to wrong person!'); // eslint-disable-line no-console
            } else {
              if (has(process.env, 'SMTP_TEST') && parseInt(process.env.SMTP_TEST, 10) === 1) {
                console.log(user.username, vertrag.id); // eslint-disable-line no-console
              }

              const vertragspartner = vertrag.__data.vertragspartner; // eslint-disable-line no-underscore-dangle, max-len, // TODO: this is freakin shit
              const tage = moment.range(moment(), vertrag.kuendigungsdatum).diff('days');
              const benachrichtigungCtr = 3 - benachrichtigungsfristen.findIndex(element => element >= tage); // eslint-disable-line max-len

              if (vertrag.benachrichtigungCtr !== benachrichtigungCtr) {
                sendmail = true;

                text += '<tr>';
                text += `<td style="padding: 8px; line-height: 1.42857; vertical-align: top; border-top: 1px solid #DDD;"><a href="https://cloudcontracts.pco-cloud.de/vertrag/${vertrag.id}/" style="background-color: transparent; color: black">${vertrag.bezeichnung}</a></td>`;
                text += `<td style="padding: 8px; line-height: 1.42857; vertical-align: top; border-top: 1px solid #DDD;">${vertragspartner.firmenname}</td>`;
                text += `<td style="padding: 8px; line-height: 1.42857; vertical-align: top; border-top: 1px solid #DDD;">${moment(vertrag.kuendigungsdatum).format('DD.MM.YYYY')} (${(tage < 0 ? 'bereits abgelaufen' : `noch ${tage} Tage`)})</td>`;
                text += '</tr>';

                Vertrag.updateAll({ id: vertrag.id }, { benachrichtigungCtr });
              }
            }
          });

          if (sendmail) {
            text += '</tbody></table><p style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; width: 100%;">Mit freundlichem Gru&szlig;,<br>Ihr CloudContracts</p><p><a style="background-color: transparent; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; width: 100%;" href="https://cloudcontracts.pco-cloud.de/">https://cloudcontracts.pco-cloud.de/</a></p>';

            httpRequest.post('http://postoffice:3000/', {
              recipient: user.email,
              subject: 'CloudContracts: Reminder',
              content: text,
              type: 'HTML',
            })
              .then(() => SmtpMail.create({
                nachricht: text,
                idgruppe: user.id,
                benutzer: 'api',
                absender: 'noreply@cloudcontracts.de',
                verweis: parseInt(user.idKunde, 10),
                erstellt: moment().toDate(),
                status: 1,
              }))
              .catch(sendErr => SmtpMail.create({
                nachricht: text,
                idgruppe: user.id,
                benutzer: sendErr,
                absender: 'noreply@cloudcontracts.de',
                verweis: parseInt(user.idKunde, 10),
                erstellt: moment().toDate(),
                status: 0,
              }));
          }
        });
      });
      if (cb) {
        cb(null, null);
      }
    });
  };

  SmtpMail.remoteMethod('bericht', {
    http: {
      path: '/bericht',
      verb: 'GET',
    },
    returns: {
      root: true,
      type: ['object'],
    },
  });
};
