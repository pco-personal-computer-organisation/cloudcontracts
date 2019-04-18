import * as angular from 'angular';
import template from './password-change.template.html';

class PasswordChangeCtrl {
  constructor($timeout, User, Error) {
    Object.assign(this, { $timeout, User, Error });

    this.wrongPassword = false;
    this.wrongRepeat = false;
  }

  $onInit() {
    this.user = this.User.getCurrent();
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }

  save() {
    if (this.password.new !== this.repeat) {
      this.shake = true;
      this.$timeout(() => {
        this.shake = false;
      }, 1000);
      this.wrongRepeat = true;

      angular.element('input[name="repeatpassword"]').focus();
    } else {
      (this.user.role.name !== 'admin' ? this.User.changePassword({
        id: this.User.getCurrentId(),
        oldPassword: this.password.old,
        newPassword: this.password.new,
      }) : this.User.changePasswordAdmin({
        id: this.resolve.user.id,
        newPassword: this.password.new,
      })).$promise
        .then((value) => {
          if (value.isChanged) {
            this.modalInstance.close();
          } else {
            this.shake = true;
            this.$timeout(() => {
              this.shake = false;
            }, 1000);
            this.wrongPassword = true;

            angular.element('input[name="oldpassword"]').focus();
          }
        })
        .catch(err => this.Error.message(err));
    }
  }
}

angular.module('passwordChange')
  .component('passwordChange', {
    template,
    bindings: {
      modalInstance: '<',
      resolve: '<',
    },
    controller: PasswordChangeCtrl,
  });
