import * as angular from 'angular';
import template from './datenschutz-erklaerung.template.html';

if (!Object.values) { // Object.values polyfill
  Object.values = o => Object.keys(o).map(n => o[n]);
}

class DatenschutzErklaerungCtrl {
  constructor(User) {
    Object.assign(this, { User });
  }

  /* $onInit() {
  } */

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('datenschutzErklaerung')
  .component('datenschutzErklaerung', {
    template,
    bindings: {
      modalInstance: '<',
      resolve: '<',
    },
    controller: DatenschutzErklaerungCtrl,
  });
