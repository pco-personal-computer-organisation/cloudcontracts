import * as angular from 'angular';
import template from './sla-destroy.template.html';

class SlaDestroyCtrl {
  $onInit() {
    this.sla = this.resolve.sla;
  }

  destroy() {
    this.modalInstance.close(this.sla);
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('slaDestroy')

.component('slaDestroy', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: SlaDestroyCtrl,
});
