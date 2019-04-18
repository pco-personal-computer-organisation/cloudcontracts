const moment = require('moment');

const has = (o, k) => o.hasOwnProperty.call(o, k);

/* eslint-disable no-param-reassign */

module.exports = (Historie) => {
  Historie.sanitizedCreate = (data, userId, cb) => {
    if (!has(data, 'datum') || !data.datum) {
      data.datum = moment().toDate();
    }

    if (!has(data, 'idUser') || !data.idUser) {
      data.idUser = userId;
    }

    if (typeof data.diff !== 'string') {
      data.diff = JSON.stringify(data.diff);
    }

    Historie.create(data, cb);
  };
};
