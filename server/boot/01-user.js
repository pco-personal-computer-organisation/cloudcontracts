const _ = require('lodash');

/* eslint-disable no-param-reassign */

module.exports = (app) => {
  const {
    User,
    Kunde,
    Role,
    RoleMapping,
    AccessToken,
    SmtpRecipientGroup,
  } = app.models;

  RoleMapping.defineProperty('principalId', { type: 'number' });

  User.defineProperty('idKunde', { type: 'number' });
  User.defineProperty('benachrichtigungsfrist1', { type: 'number' });
  User.defineProperty('benachrichtigungsfrist2', { type: 'number' });
  User.defineProperty('benachrichtigungsfrist3', { type: 'number' });
  User.defineProperty('idStellvertreter', { type: 'number' });
  User.defineProperty('stellvertreterAktiv', { type: 'boolean' });
  User.defineProperty('vorname', { type: 'string' });
  User.defineProperty('nachname', { type: 'string' });
  User.defineProperty('benachrichtigung', { type: 'boolean' });

  // User.settings.hidden.push('idKunde'); //app crashes..

  User.beforeRemote('count', (ctx, out, next) => {
    User.findById(ctx.req.accessToken.userId, (err, user) => {
      if (err) {
        next(new Error(err));
        return;
      }

      user = JSON.parse(JSON.stringify(user));

      let where;
      if (_.has(ctx.args.where)) {
        where = JSON.parse(ctx.args.where);
        where.idKunde = user.idKunde;
      } else {
        where = { idKunde: user.idKunde };
      }

      ctx.args.where = JSON.stringify(where);

      next();
    });
  });

  User.settings.acls.push({
    property: 'count',
    accessType: 'READ',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: '$authenticated',
  });

  User.belongsTo('Kunde', { foreignKey: 'idKunde' });

  User.hasMany('vertrag', { foreignKey: 'idKoordinator' });

  User.hasMany('role', { through: RoleMapping, foreignKey: 'principalId' });

  User.afterRemote('find', (ctx, remoteMethodOutput, next) => {
    User.findById(ctx.req.accessToken.userId, (err, userObj) => {
      if (!err) {
        ctx.result = _.filter(ctx.result, { idKunde: userObj.idKunde });
      }
      next();
    });
  });

  User.afterRemote('findById', (ctx, remoteMethodOutput, next) => {
    ctx.result = JSON.parse(JSON.stringify(ctx.result));

    Kunde.findById(ctx.result.idKunde, (err, kunde) => {
      if (err) {
        console.log('error regarding kunde', err); // eslint-disable-line no-console
        next();
      }

      ctx.result.kunde = JSON.parse(JSON.stringify(kunde));

      RoleMapping.findOne({
        where: {
          principalId: ctx.result.id,
          principalType: 'USER',
        },
      }, (errOne, principal) => {
        if (err) {
          console.log('error regarding principal', errOne); // eslint-disable-line no-console
          next();
        }

        Role.findById(principal.roleId, (errById, role) => {
          if (err) {
            console.log('error regarding role', errById); // eslint-disable-line no-console
            next();
          }

          ctx.result.role = JSON.parse(JSON.stringify(role));

          next();
        });
      });
    });
  });

  User.afterRemote('login', (ctx, remoteMethodOutput, next) => {
    ctx.result = JSON.parse(JSON.stringify(ctx.result));

    User.findById(ctx.result.userId, { include: ['Kunde', 'role'] }, (err, user) => {
      if (err) {
        console.log('error regarding user', err); // eslint-disable-line no-console
        next();
        return;
      }

      ctx.result.user = JSON.parse(JSON.stringify(user));

      [ctx.result.user.role] = ctx.result.user.role;
      ctx.result.user.kunde = ctx.result.user.Kunde;
      delete ctx.result.user.Kunde;

      if (_.includes(ctx.result.user.status, 'locked')) {
        ctx.res.status(401).end(); // next(new Error('User is locked'));
      } else {
        next();
      }
    });
  });

  User.changePassword = (id, oldPassword, newPassword, cb) => {
    User.findById(id, (err, userObj) => {
      userObj.hasPassword(oldPassword, (errHasPassword, isMatch) => {
        if (isMatch) {
          userObj.updateAttribute('password', User.hashPassword(newPassword), (errHash) => {
            if (errHash) {
              cb(null, false);
            } else {
              cb(null, true);
            }
          });
        } else {
          cb(null, false);
        }
      });
    });
  };

  User.remoteMethod('changePassword', {
    http: { path: '/:id/changePassword/', verb: 'put' },
    accepts: [
      { arg: 'id', type: 'number', required: true },
      { arg: 'oldPassword', type: 'String', required: true },
      { arg: 'newPassword', type: 'String', required: true },
    ],
    returns: { arg: 'isChanged', type: 'Boolean' /* , root: true */ },
    isStatic: true,
  });

  User.changePasswordAdmin = (id, newPassword, ctx, cb) => {
    User.findById(id)
      .then(userObj => userObj.updateAttribute('password', User.hashPassword(newPassword)))
      .then(() => cb(null, true))
      .catch(() => cb(null, false));
  };

  User.remoteMethod('changePasswordAdmin', {
    http: { path: '/:id/changePasswordAdmin/', verb: 'put' },
    accepts: [
      { arg: 'id', type: 'number', required: true },
      { arg: 'newPassword', type: 'String', required: true },
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    returns: { arg: 'isChanged', type: 'Boolean' /* , root: true */ },
    isStatic: true,
  });

  User.settings.acls.push({
    property: 'changePasswordAdmin',
    accessType: 'EXECUTE',
    permission: 'DENY',
    principalType: 'ROLE',
    principalId: '$owner',
  });

  User.settings.acls.push({
    property: 'changePasswordAdmin',
    accessType: 'EXECUTE',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: 'admin',
  });

  User.changeRole = (id, roleId, cb) => { // TODO: implement or delete!
    cb();
  };

  User.remoteMethod('changeRole', {
    http: { path: '/:id/changeRole/', verb: 'put' },
    accepts: [
      { arg: 'id', type: 'number', required: true },
      { arg: 'roleId', type: 'number', required: true },
    ],
    returns: { arg: 'isChanged', type: 'Boolean' /* , root: true */ },
    isStatic: true,
  });

  User.lock = (id, cb) => {
    User.findById(id, { include: 'role' }, (err, user) => {
      const userObj = JSON.parse(JSON.stringify(user));
      [userObj.role] = userObj.role;

      if (_.includes(userObj.status, 'locked')) {
        cb(null, user);
        return;
      }

      if (userObj.status) {
        userObj.status += ',locked';
      } else {
        userObj.status = 'locked';
      }

      user.updateAttribute('status', userObj.status, (updateErr) => {
        if (updateErr) {
          cb(updateErr);
          return;
        }

        AccessToken.destroyAll({ userId: id }, (destroyErr) => {
          if (destroyErr) {
            cb(destroyErr);
          } else {
            cb(null, userObj);
          }
        });
      });
    });
  };

  User.remoteMethod('lock', {
    http: { path: '/lock/', verb: 'put' },
    accepts: [
      { arg: 'id', type: 'number', required: true },
    ],
    returns: { type: 'object', root: true },
    isStatic: true,
  });

  User.settings.acls.push({
    property: 'lock',
    accessType: 'EXECUTE',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: 'admin',
  });

  User.unlock = (id, cb) => {
    User.findById(id, { include: 'role' }, (err, user) => {
      const userObj = JSON.parse(JSON.stringify(user));
      [userObj.role] = userObj.role;

      if (!userObj.status) {
        cb(null, userObj);
      } else if (userObj.status === 'locked') {
        userObj.status = null;
      } else {
        userObj.status.replace(',locked', '');
      }

      user.updateAttribute('status', userObj.status, (updateErr) => {
        if (updateErr) {
          cb(updateErr);
        } else {
          cb(null, userObj);
        }
      });
    });
  };

  User.remoteMethod('unlock', {
    http: { path: '/unlock/', verb: 'put' },
    accepts: [
      { arg: 'id', type: 'number', required: true },
    ],
    returns: { type: 'object', root: true },
    isStatic: true,
  });

  User.settings.acls.push({
    property: 'unlock',
    accessType: 'EXECUTE',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: 'admin',
  });

  User.beforeRemote('prototype.updateAttributes', (ctx, remoteMethodOutput, next) => {
    User.findById(ctx.req.accessToken.userId, { include: 'role' }, (err, userObj) => {
      if (err) {
        next(new Error(err));
        return;
      }

      userObj = JSON.parse(JSON.stringify(userObj));

      if (userObj.role[0].name !== 'admin' || ctx.req.accessToken.userId !== userObj.id) {
        next(new Error('Not authorized'));
      } else {
        next();
      }
    });
  });

  User.afterRemote('prototype.updateAttributes', (ctx, remoteMethodOutput, next) => {
    const userObj = JSON.parse(JSON.stringify(ctx.req.body));
    RoleMapping.updateAll({ principalType: 'USER', principalId: userObj.id }, { roleId: userObj.role.id }, (updateErr) => {
      if (updateErr) {
        next(new Error(updateErr));
      } else {
        next();
      }
    });
  });

  User.beforeRemote('create', (ctx, remoteMethodOutput, next) => {
    const { body } = ctx.req;

    User.findById(ctx.req.accessToken.userId, { include: 'Kunde' }, (err, userObj) => {
      if (err) {
        next(new Error(err));
        return;
      }

      userObj = JSON.parse(JSON.stringify(userObj));

      User.count({ idKunde: userObj.idKunde }, (countErr, userCount) => {
        if (userCount >= userObj.Kunde.maxusers) {
          ctx.res.status(403);
          // ctx.res.render('error', { error: 'maximum user count already reached' });
          next(new Error('maximum user count already reached'));
          return;
        }

        body.idKunde = userObj.idKunde;

        next();
      });
    });
  });

  User.afterRemote('create', (ctx, remoteMethodOutput, next) => {
    const userObj = JSON.parse(JSON.stringify(ctx.result));
    const newUser = JSON.parse(JSON.stringify(ctx.req.body));

    delete userObj.repeatpassword;

    SmtpRecipientGroup.create({
      idgruppe: userObj.id,
      idempfaenger: userObj.id,
      beschreibung: `${userObj.vorname} ${userObj.nachname}`,
    })
      .catch(err => console.error('Failed to add user to smtp_recipient_groups (this has nothing to do with postoffice, only with smtp):', err)); // eslint-disable-line no-console

    RoleMapping.create({
      principalType: 'USER',
      principalId: remoteMethodOutput.id,
      roleId: newUser.role.id,
    }, (err) => {
      if (err) {
        next(new Error(err));
        return;
      }

      Role.findById(newUser.role.id, (findErr, role) => {
        if (findErr) {
          next(new Error(findErr));
          return;
        }

        userObj.role = role;
        ctx.result = userObj;
        next();
      });
    });
  });

  User.afterRemote('deleteById', (ctx, remoteMethodOutput, next) => {
    if (parseInt(ctx.req.params.id, 10) > 0) {
      SmtpRecipientGroup.destroyAll({ idgruppe: parseInt(ctx.req.params.id, 10) }, (err, ok) => { // eslint-disable-line no-unused-vars, max-len
        next();
      });
    }
  });

  User.version = (cb) => {
    cb(null, app.get('version'));
  };

  User.remoteMethod('version', {
    http: {
      path: '/version',
      verb: 'get',
    },
    returns: {
      type: 'String',
      root: true,
    },
  });

  User.settings.acls.push({
    property: 'version',
    accessType: 'EXECUTE',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: '$authenticated',
  });

  User.afterRemote('findById', (ctx, out, next) => {
    out = _.filter(out, { idKunde: process.env.CUSTOMER_ID });
    next();
  });

  User.settings.acls.push({
    property: 'findById',
    accessType: 'READ',
    permission: 'ALLOW',
    principalType: 'ROLE',
    principalId: 'admin',
  });
};
