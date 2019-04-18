const _ = require('lodash');
const moment = require('moment');
const request = require('request');
const utils = require('loopback/lib/utils');

/* eslint-disable no-param-reassign */

module.exports = (Waehrung) => {
  Waehrung.currencyCache = {}; // map, that contains currency conversions by date and base 'EUR'

  Waehrung.currencyConversion = (date, fromValue, fromCurrency, toCurrency, cb) => {
    cb = cb || utils.createPromiseCallback();

    date = moment(date) >= moment('1999-01-04') ? moment(date).format('YYYY-MM-DD') : moment('1999-01-04').format('YYYY-MM-DD');

    if (fromCurrency === toCurrency) {
      cb(null, fromValue);
    } else if (_.has(Waehrung.currencyCache, date)) {
      if (fromCurrency === 'EUR') {
        cb(null, _.round(fromValue * Waehrung.currencyCache[date][toCurrency], 4));
      } else {
        cb(null, _.round(fromValue / Waehrung.currencyCache[date][fromCurrency], 4));
      }
    } else {
      request({ url: `http://api.fixer.io/${date}?base=EUR`, json: true }, (err, res, body) => {
        if (err) {
          cb(err, null);
          return;
        }

        if (body.rates) {
          Waehrung.currencyCache[date] = body.rates;
        }

        if (Waehrung.currencyCache[date] === undefined) {
          cb('date does not exist in cache', null);
          console.log('date does not exist in cache', date, Waehrung.currencyCache);
          return;
        }

        if (fromCurrency === 'EUR' && Object.keys(Waehrung.currencyCache[date]).includes(toCurrency)) {
          cb(null, _.round(fromValue * Waehrung.currencyCache[date][toCurrency], 4));
        } else if (Object.keys(Waehrung.currencyCache[date]).includes(fromCurrency)) {
          cb(null, _.round(fromValue / Waehrung.currencyCache[date][fromCurrency], 4));
        } else {
          cb('err');
        }
      });
    }

    return cb.promise;
  };
};
