import * as angular from 'angular';
import template from './user-lock.template.html';

class UserLockCtrl {
  constructor(User) {
    Object.assign(this, { User });
  }

  $onInit() {
    this.user = angular.copy(this.resolve.user);
  }

  destroy() {
    this.User.lock({ id: this.user.id }, (lockedUser) => {
      this.modalInstance.close(lockedUser);
    });
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('userLock')

.component('userLock', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: UserLockCtrl,
});
