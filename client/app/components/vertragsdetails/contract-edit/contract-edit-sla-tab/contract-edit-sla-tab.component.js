import moment from 'moment';
import * as angular from 'angular';
import template from './contract-edit-sla-tab.template.html';

class ContractEditSlaTabCtrl {
  constructor($uibModal, NgTableParams, Sla, User) {
    Object.assign(this, { $uibModal, NgTableParams, Sla, User, moment });

    this.user = this.User.getCurrent();
    //this.delSLA = [];
  }

  $onInit() {
    this.slaParams = this.Sla.parameterList();
  }

  addSLA() {
    if (this.newSLA.name && this.newSLA.wert) {
      this.vertrag.slas.push(this.newSLA);
      this.newSLA = {};
      angular.element('input[name="slaName"]').focus();
    }
  }

  destroySLA(sla) {
    if (sla.id) {
      this.delSLA.push(sla.id);
    }
    this.vertrag.slas = this.vertrag.slas.filter(n => n !== sla);
  }
}

angular.module('contractEditSlaTab')

.component('contractEditSlaTab', {
  template,
  bindings: {
    vertrag: '=',
    delSLA: '=',
  },
  controller: ContractEditSlaTabCtrl,
});
