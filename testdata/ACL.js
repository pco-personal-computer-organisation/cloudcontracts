module.exports = [{
  model: 'User',
  property: 'find',
  accessType: 'READ',
  permission: 'ALLOW',
  principalType: 'ROLE',
  principalId: '$authenticated',
  id: 1,
}, {
  model: 'User',
  property: 'findOne',
  accessType: 'READ',
  permission: 'DENY',
  principalType: 'ROLE',
  principalId: '$everyone',
  id: 2,
}, {
  model: 'User',
  property: 'findById',
  accessType: 'READ',
  permission: 'ALLOW',
  principalType: 'ROLE',
  principalId: '$owner',
  id: 3,
}, {
  model: 'User',
  property: 'changePassword',
  accessType: 'EXECUTE',
  permission: 'ALLOW',
  principalType: 'ROLE',
  principalId: '$owner',
  id: 6,
}, {
  model: 'User',
  property: 'login',
  accessType: 'EXECUTE',
  permission: 'ALLOW',
  principalType: 'ROLE',
  principalId: '$everyone',
  id: 9,
}, {
  model: 'RoleMapping',
  property: '*',
  accessType: '*',
  permission: 'DENY',
  principalType: 'ROLE',
  principalId: '*',
  id: 10,
}, {
  model: 'RoleMapping',
  property: 'findOne',
  accessType: 'READ',
  permission: 'ALLOW',
  principalType: 'ROLE',
  principalId: '$owner',
  id: 11,
}, {
  model: 'User',
  property: 'roleById',
  accessType: 'READ',
  permission: 'ALLOW',
  principalType: 'ROLE',
  principalId: '$owner',
  id: 12,
}, {
  model: 'Kunde',
  property: 'find',
  accessType: 'READ',
  permission: 'ALLOW',
  principalType: 'ROLE',
  principalId: '$owner',
  id: 13,
}, {
  model: 'User',
  property: 'list',
  accessType: 'READ',
  permission: 'ALLOW',
  principalType: 'ROLE',
  principalId: '$authenticated',
  id: 14,
}, {
  model: 'User',
  property: 'destroyById',
  accessType: 'WRITE',
  permission: 'ALLOW',
  principalType: 'ROLE',
  principalId: '$authenticated',
  id: 16,
}, {
  model: 'User',
  property: 'updateAttributes',
  accessType: 'WRITE',
  permission: 'ALLOW',
  principalType: 'ROLE',
  principalId: '$authenticated',
  id: 17,
}];
