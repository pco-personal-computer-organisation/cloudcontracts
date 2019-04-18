import * as angular from 'angular';
import template from './user-unlock.template.html';

class UserUnlockCtrl {
  constructor(User) {
    Object.assign(this, { User });
  }

  $onInit() {
    this.user = angular.copy(this.resolve.user);
  }

  destroy() {
    this.User.unlock({ id: this.user.id }, (unlockedUser) => {
      this.modalInstance.close(unlockedUser);
    });
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('userUnlock')

.component('userUnlock', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: UserUnlockCtrl,
});
