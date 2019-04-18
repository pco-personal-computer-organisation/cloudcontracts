const Roles = require('./Role');
const RoleMappings = require('./RoleMapping');
const Users = require('./User');
const pick = require('./pick');

const userFields = ['id', 'username', 'email', 'status', 'created', 'lastUpdated', 'idKunde', 'benachrichtigungsfrist1', 'benachrichtigungsfrist2', 'benachrichtigungsfrist3', 'idStellvertreter', 'stellvertreterAktiv', 'vorname', 'nachname', 'benachrichtigung'];

module.exports = Users.filter(u => RoleMappings.filter(n => n.principalType === 'USER' && n.principalId === u.id).length > 0).map((user) => {
  const { roleId } = RoleMappings.filter(n => n.principalType === 'USER' && n.principalId === user.id)[0];
  const role = Roles.filter(n => n.id === roleId)[0];

  return Object.assign(pick(user, userFields), {
    roleId,
    roleName: role.name,
    roleDescription: role.description,
  });
});
