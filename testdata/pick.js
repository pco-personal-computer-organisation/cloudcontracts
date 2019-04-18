module.exports = (obj, fields) => fields.reduce((o, k) => { o[k] = obj[k]; return o; }, {}); // eslint-disable-line no-param-reassign, max-len
