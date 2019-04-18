import moment from 'moment';
import * as angular from 'angular';
import template from './contract-view-business-tab.template.html';

class ContractViewBusinessTabCtrl {
  constructor(Kosten, Faelligkeit, Waehrung, Vertrag, $location) {
    Object.assign(this, {
      Kosten,
      Faelligkeit,
      Waehrung,
      Vertrag,
      $location,
      moment,
    });

    this.kosten = {};
    this.delKosten = []; // array of IDs to delete from DB if entry was deleted in view
  }

  $onInit() {
    this.kostenstelleParams = this.Vertrag.kostenstelleList();
    this.faelligkeitOpts = this.Faelligkeit.find();
    this.waehrungOpts = this.Waehrung.find();
  }
}

angular.module('contractViewBusinessTab')
  .component('contractViewBusinessTab', {
    template,
    bindings: {
      vertrag: '=',
    },
    controller: ContractViewBusinessTabCtrl,
  });
