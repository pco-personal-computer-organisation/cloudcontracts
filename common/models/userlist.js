const _ = require('lodash');

/* eslint-disable no-param-reassign */

module.exports = (Userlist) => {
  Userlist.afterRemote('find', (ctx, out, next) => {
    ctx.result = _.filter(ctx.result, { idKunde: parseInt(process.env.CUSTOMER_ID, 10) });
    next();
  });
};
