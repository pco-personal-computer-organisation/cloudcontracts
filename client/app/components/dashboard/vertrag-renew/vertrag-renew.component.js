import moment from 'moment';
import * as angular from 'angular';
import template from './vertrag-renew.template.html';

class VertragRenewCtrl {
  constructor(Vertrag, Status, Vertragspartner) {
    Object.assign(this, { Vertrag, Status, Vertragspartner, moment });
  }

  $onInit() {
    this.statusOpts = this.Status.find();
    this.vertragspartnerOpts = this.Vertragspartner.partnerFirmen();

    this.Vertrag.findById({ id: this.resolve.idVertrag }).$promise
    .then((vertrag) => {
      vertrag.laufzeitende = moment(vertrag.laufzeitende).toDate(); // eslint-disable-line no-param-reassign, max-len
      this.vertrag = vertrag;
    });
  }

  onKuendigungsfristChanged() {
    this.vertrag.kuendigungsdatum = moment(this.vertrag.laufzeitende).subtract(this.vertrag.kuendigungsfrist, 'months').toDate();
  }

  onlaufzeitendeChanged() {
    this.vertrag.kuendigungsdatum = moment(this.vertrag.laufzeitende).subtract(this.vertrag.kuendigungsfrist, 'months').toDate();
  }

  onUnbegrenzteLaufzeitChanged() {
    if (this.unbegrenzteLaufzeit) {
      this.vertrag.laufzeitende = null;
    }
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

angular.module('vertragRenew')

.component('vertragRenew', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: VertragRenewCtrl,
});
