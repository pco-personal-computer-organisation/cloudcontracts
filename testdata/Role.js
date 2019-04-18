const addDays = require('./addDays');

module.exports = [{
  id: 1,
  name: 'admin',
  description: 'Administrator',
  created: addDays('2015-07-27T16:11:27.000Z'),
  modified: addDays('2015-07-27T16:11:27.000Z'),
}, {
  id: 2,
  name: 'manager',
  description: 'Benutzer',
  created: addDays('2015-07-27T16:11:27.000Z'),
  modified: addDays('2015-07-27T16:11:27.000Z'),
}, {
  id: 3,
  name: 'readonly',
  description: 'Nur lesen',
  created: addDays('2015-07-27T16:11:27.000Z'),
  modified: addDays('2015-07-27T16:11:27.000Z'),
}];
