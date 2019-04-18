import * as angular from 'angular';
import template from './gegenstand-destroy.template.html';

class GegenstandDestroyCtrl {
  $onInit() {
    this.gegenstand = this.resolve.gegenstand;
  }

  destroy() {
    this.modalInstance.close(this.gegenstand);
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('gegenstandDestroy')

.component('gegenstandDestroy', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: GegenstandDestroyCtrl,
});
