import moment from 'moment';
import * as angular from 'angular';
import template from './contract-edit-business-tab.template.html';

class ContractEditBusinessTabCtrl {
  constructor(Kosten, Faelligkeit, Waehrung, Vertrag) {
    Object.assign(this, {
      Kosten,
      Faelligkeit,
      Waehrung,
      Vertrag,
      moment,
    });

    this.kosten = {};
    this.delKosten = []; // array of IDs to delete from DB if entry was deleted in view
  }

  $onInit() {
    this.kostenstelleParams = this.Vertrag.kostenstelleList();
    this.faelligkeitOpts = this.Faelligkeit.find();
    this.waehrungOpts = this.Waehrung.find();

    const promise = this.vertrag.$promise || Promise.resolve(this.vertrag);
    promise
      .then(() => {
        this.vertrag.kosten = this.vertrag.kosten.map((n) => {
          n.datum = new Date(n.datum); // eslint-disable-line no-param-reassign
          return n;
        });
      })
      .catch(console.error); // eslint-disable-line no-console
  }

  addKosten() {
    this.kosten.idVertrag = this.vertrag.id;
    this.kosten.waehrung = this.waehrungOpts.find(n => n.id === this.kosten.idWaehrung); // eslint-disable-line max-len
    this.kosten.faelligkeit = this.faelligkeitOpts.find(n => n.id === this.kosten.idFaelligkeit); // eslint-disable-line max-len

    if ({}.hasOwnProperty.call(this.vertrag, 'kosten')) {
      this.vertrag.kosten.push(this.kosten);
    } else {
      this.vertrag.kosten = [this.kosten];
    }

    this.kosten = {};
  }

  deleteKosten(data) {
    this.delKosten.push(data.id);
    this.vertrag.kosten = this.vertrag.kosten.filter(n => n !== data);
  }
}

angular.module('contractEditBusinessTab')
  .component('contractEditBusinessTab', {
    template,
    bindings: {
      vertrag: '=',
      delKosten: '=',
      kosten: '=',
    },
    controller: ContractEditBusinessTabCtrl,
  });
