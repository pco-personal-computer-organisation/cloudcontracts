import * as angular from 'angular';
import template from './user-destroy.template.html';

class UserDestroyCtrl {
  $onInit() {
    this.user = angular.copy(this.resolve.user);
  }

  destroy() {
    this.modalInstance.close(this.user);
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('userDestroy')

.component('userDestroy', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: UserDestroyCtrl,
});
