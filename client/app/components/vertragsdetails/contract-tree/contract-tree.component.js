import * as angular from 'angular';
import template from './contract-tree.template.html';

class ContractTreeCtrl {
  constructor($location) {
    Object.assign(this, { $location });
  }
}

angular.module('contractTree')

.component('contractTree', {
  template,
  bindings: {
    items: '<',
    contractId: '<',
  },
  controller: ContractTreeCtrl,
});
