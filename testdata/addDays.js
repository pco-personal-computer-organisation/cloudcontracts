const moment = require('moment');

const addDays = date => moment(date).add(moment().diff('2016-11-30', 'days'), 'days').toDate();

module.exports = addDays;
