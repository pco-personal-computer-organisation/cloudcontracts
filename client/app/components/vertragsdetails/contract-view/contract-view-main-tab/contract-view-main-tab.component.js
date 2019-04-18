import moment from 'moment';
import * as angular from 'angular';
import template from './contract-view-main-tab.template.html';

class ContractViewMainTabCtrl {
  constructor($uibModal, $interpolate, $location, Vertrag, Vertragspartner, Vertragsart, Status, Kuendigungsoption, Kategorien, User) { // eslint-disable-line max-len
    Object.assign(this, {
      $uibModal,
      $interpolate,
      $location,
      Vertrag,
      Vertragspartner,
      Vertragsart,
      Status,
      Kuendigungsoption,
      Kategorien,
      User,
      moment,
    }); // eslint-disable-line max-len

    this.selectedVertragspartner = {};
  }

  $onInit() {
    this.kostenstelleParams = this.Vertrag.kostenstelleList();
    this.vertragsartOpts = this.Vertragsart.find();
    this.statusOpts = this.Status.find();
    this.kuendigungsoptionOpts = this.Kuendigungsoption.find();
    this.kategorien = this.Kategorien.find();

    const promise = this.vertrag.$promise || Promise.resolve(this.vertrag);
    promise.then(() => {
      this.User.find({
        filter: {
          order: ['nachname ASC', 'vorname ASC', 'email ASC'],
        },
      }).$promise
        .then((values) => {
          this.koordinatorOpts = [{
            id: null,
            name: '(keiner)',
          }, ...values.map(n => ({ id: n.id, name: `${n.nachname}, ${n.vorname} (${n.email})` }))];
          this.koordinator = this.koordinatorOpts.find(n => n.id === this.vertrag.idKoordinator);
        })
        .catch(console.error); // eslint-disable-line no-console
    });

    this.Vertragspartner.partnerFirmen().$promise
      .then((values) => {
        this.vertragspartnerOpts = values.map(n => Object.assign({}, n, {
          firmenname: n.kundennr ? `${n.firmenname} (${n.kundennr})` : n.firmenname,
        }));

        if ({}.hasOwnProperty.call(this.vertrag, 'idVertragspartner') && this.vertrag.idVertragspartner) {
          this.selectedVertragspartner = this.vertragspartnerOpts.find(n => n.id === this.vertrag.idVertragspartner); // eslint-disable-line max-len
        }
      })
      .catch(console.error); // eslint-disable-line no-console
  }
}

angular.module('contractViewMainTab')
  .component('contractViewMainTab', {
    template,
    bindings: {
      vertrag: '=',
    },
    controller: ContractViewMainTabCtrl,
  });
