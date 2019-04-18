import * as angular from 'angular';
import template from './contract-view-sla-tab.template.html';

class ContractViewSlaTabCtrl {
  constructor($location) {
    Object.assign(this, { $location });
  }
}

angular.module('contractViewSlaTab')

.component('contractViewSlaTab', {
  template,
  bindings: {
    vertrag: '=',
  },
  controller: ContractViewSlaTabCtrl,
});
