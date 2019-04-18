import moment from 'moment';
import * as angular from 'angular';
import template from './contract-view-hierarchy-tab.template.html';

class ContractViewHierarchyTabCtrl {
  constructor(Vertrag, Vertragsliste) {
    Object.assign(this, { Vertrag, Vertragsliste, moment });
  }

  $onInit() {
    const promise = this.vertrag.$promise || Promise.resolve(this.vertrag);
    promise.then(() => {
      this.contractTree = this.Vertrag.contractTree({ id: this.vertrag.id });

      this.Vertragsliste.find((values) => {
        if ({}.hasOwnProperty.call(this.vertrag, 'id')) {
          values = values.filter(n => n.id !== this.vertrag.id); // eslint-disable-line no-param-reassign, max-len
          values.map((n) => {
            n.bezeichnung = `${n.bezeichnung} (${n.vertragsnr})`; // eslint-disable-line no-param-reassign
            return n;
          });
          values.unshift({ id: 0, bezeichnung: '(keine Zuordnung)' });
          this.selectedItem = values.find(n => n.id === this.vertrag.idparent);
        }

        this.vertraegeOpts = values;

        return values;
      });
    });
  }
}

angular.module('contractViewHierarchyTab')

.component('contractViewHierarchyTab', {
  template,
  bindings: {
    vertrag: '=',
  },
  controller: ContractViewHierarchyTabCtrl,
});
