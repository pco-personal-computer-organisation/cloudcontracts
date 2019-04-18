import moment from 'moment';
import * as angular from 'angular';
import template from './contract-view.template.html';

class ContractViewCtrl {
  constructor($routeParams, $uibModal, $location, Kategorien, Vertrag, Sla, Vertragsart, Status, Kuendigungsoption, User) { // eslint-disable-line max-len
    Object.assign(this, { $routeParams, $uibModal, $location, Kategorien, Vertrag, Sla, Vertragsart, Status, Kuendigungsoption, User, moment }); // eslint-disable-line max-len

    this.newSLA = {};
    this.saving = false;
    this.selectedVertragspartner = {};

    this.janeinOpts = [{
      id: 1,
      name: 'Ja',
    }, {
      id: 0,
      name: 'Nein',
    }];
  }

  $onInit() {
    if ({}.hasOwnProperty.call(this.$routeParams, 'kategorieid')) {
      this.kategorieid = this.$routeParams.kategorieid;
    }

    this.user = this.User.getCurrent();
    this.slaParams = this.Sla.parameterList();
    this.vertragsartOpts = this.Vertragsart.find();
    this.statusOpts = this.Status.find();
    this.kategorien = this.Kategorien.find();
    this.kuendigungsoptionOpts = this.Kuendigungsoption.find();

    this.vertrag = this.Vertrag.findOne({
      filter: {
        include: ['slas', 'vertragspartner', 'vertragsgegenstaende', 'dokumente', { kosten: ['waehrung', 'faelligkeit'] }],
        where: { id: this.$routeParams.vertragid },
      },
    }).$promise
    .then((vertrag) => {
      this.vertrag = vertrag;

      if (this.vertrag.anlagedatum) {
        this.vertrag.anlagedatum = new Date(this.vertrag.anlagedatum);
      } else {
        this.vertrag.anlagedatum = null;
      }

      if (vertrag.laufzeitbeginn) {
        this.vertrag.laufzeitbeginn = new Date(this.vertrag.laufzeitbeginn);
      } else {
        this.vertrag.laufzeitbeginn = null;
      }

      if (this.vertrag.laufzeitende) {
        this.vertrag.laufzeitende = new Date(this.vertrag.laufzeitende);
        this.unbegrenzteLaufzeit = false;
      } else {
        this.vertrag.laufzeitende = null;
        this.unbegrenzteLaufzeit = true;
      }

      if (this.vertrag.kuendigungsdatum) {
        this.vertrag.kuendigungsdatum = new Date(this.vertrag.kuendigungsdatum);
      } else {
        this.vertrag.kuendigungsdatum = null;
      }

      this.kategorieid = vertrag.idKategorie;

      this.loadDataAfterVertrag();
    });
  }

  loadDataAfterVertrag() {
    if ({}.hasOwnProperty.call(this.vertrag, 'kosten') && this.vertrag.kosten) {
      this.vertrag.kosten.map((item) => {
        item.datum = moment(item.datum).toDate(); // eslint-disable-line no-param-reassign
        return item;
      });
    }
  }

  destroyContract() {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'vertragDestroy',
      resolve: {
        vertrag: () => this.vertrag,
      },
    });

    modalInstance.result.then((vertrag) => {
      this.Vertrag.deleteById({ id: vertrag.id }, () => {
        this.$location.path(`/vertragsliste/${this.vertrag.idKategorie}`);
      }, (err) => {
        console.error('ok.. this should not have happened!', err); // eslint-disable-line no-console
      });
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }
}

angular.module('contractView')

.component('contractView', {
  template,
  controller: ContractViewCtrl,
});
