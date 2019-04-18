const later = require('later');
const moment = require('moment');
const _ = require('lodash');

module.exports = (app) => {
  later.date.localTime();
  let sched;

  if (_.has(process.env, 'SMTP_TEST') && parseInt(process.env.SMTP_TEST, 10) === 1) {
    console.log('SMTP_TEST'); // eslint-disable-line no-console
    sched = later.parse.text(`at ${moment().add(1, 'minutes').format('HH:mm')}`);
  } else {
    sched = later.parse.text('at 01:00 am every 1 day');
  }
  console.log('next mail creation', moment(later.schedule(sched).next(1)).format()); // eslint-disable-line no-console
  later.setInterval(app.models.SmtpMail.bericht, sched);
};
