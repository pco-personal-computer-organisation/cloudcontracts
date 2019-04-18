const addDays = require('./addDays');

module.exports = [{
  id: 1,
  name: 'pco GmbH & Co. KG',
  kdnr: '4711',
  status: 1,
  maxusers: 11,
  quota: 4096,
  created: addDays('2015-08-21T11:40:57.000Z'),
  createdBy: 'Daniel Lemper',
  laufzeitende: null,
  instanceUrl: 'http://localhost:3001',
}, {
  id: 2,
  name: 'Bauernfeind GmbH',
  kdnr: '2',
  status: 1,
  maxusers: 11,
  quota: 11,
  created: addDays('2015-08-21T11:40:57.000Z'),
  createdBy: 'dlemper',
  laufzeitende: null,
  instanceUrl: 'http://localhost:3002',
}];
