import * as angular from 'angular';
import template from './vertrag-terminate.template.html';

class VertragTerminateCtrl {
  constructor(Vertrag, Status, Vertragspartner) {
    Object.assign(this, { Vertrag, Status, Vertragspartner });
  }

  $onInit() {
    this.statusOpts = this.Status.find();
    this.vertragspartnerOpts = this.Vertragspartner.partnerFirmen();
    this.vertrag = this.Vertrag.findById({ id: this.resolve.idVertrag });
  }

  terminate() {
    this.Vertrag.upsert(this.vertrag).$promise.then(() => {
      this.modalInstance.close();
    });
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('vertragTerminate')

.component('vertragTerminate', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: VertragTerminateCtrl,
});
