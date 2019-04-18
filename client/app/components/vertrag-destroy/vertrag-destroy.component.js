import * as angular from 'angular';
import template from './vertrag-destroy.template.html';

class VertragDestroyCtrl {
  $onInit() {
    this.vertrag = angular.copy(this.resolve.vertrag);
  }

  destroy() {
    this.modalInstance.close(this.vertrag);
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('vertragDestroy')

.component('vertragDestroy', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: VertragDestroyCtrl,
});
