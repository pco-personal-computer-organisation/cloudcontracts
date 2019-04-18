import kebabCase from 'lodash/kebabCase';
import * as angular from 'angular';
import template from './user-edit.template.html';

const has = (obj, key) => obj.hasOwnProperty.call(obj, key);

class UserEditCtrl {
  constructor($uibModal, User, Role) {
    Object.assign(this, { $uibModal, User, Role });

    this.currentUser = this.User.getCurrent();
  }

  $onInit() {
    this.user = this.resolve.user ? this.User.findById({ id: this.resolve.user.id }) : { benachrichtigungsfrist1: 90, benachrichtigungsfrist2: 60, benachrichtigungsfrist3: 30 }; // eslint-disable-line max-len
    this.isCollapsed = this.resolve.user !== undefined;

    this.Role.find().$promise
      .then((values) => {
        this.roles = values;

        if (!this.resolve.user) {
          this.user.role = this.roles.find(n => n.name === 'readonly');
        }
      })
      .catch(console.error); // eslint-disable-line no-console
  }

  onVornameChange() {
    if (!has(this.user, 'id') && this.user.vorname && this.user.vorname) {
      this.user.email = `${kebabCase(this.user.vorname ? this.user.vorname : '')}.${kebabCase(this.user.nachname ? this.user.nachname : '')}@${this.currentUser.email.split('@')[1]}`;
    }
  }

  onNachnameChange() {
    if (!has(this.user, 'id') && this.user.vorname && this.user.vorname) {
      this.user.email = `${kebabCase(this.user.vorname ? this.user.vorname : '')}.${kebabCase(this.user.nachname ? this.user.nachname : '')}@${this.currentUser.email.split('@')[1]}`;
    }
  }

  onEmailChange() {
    this.user.username = this.user.email;
  }

  changePassword() {
    this.$uibModal.open({
      animation: true,
      component: 'passwordChange',
      resolve: {
        user: () => this.user,
      },
    });
  }

  save() {
    if ('id' in this.user) {
      return this.User.prototype$updateAttributes({ id: this.user.id }, this.user).$promise
        .then(() => this.modalInstance.close(this.user))
        .catch(console.error); // eslint-disable-line no-console
    }

    return this.User.create({}, this.user).$promise
      .then(userObj => this.modalInstance.close(userObj))
      .catch(console.error); // eslint-disable-line no-console
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('userEdit')
  .component('userEdit', {
    template,
    bindings: {
      modalInstance: '<',
      resolve: '<',
    },
    controller: UserEditCtrl,
  });
