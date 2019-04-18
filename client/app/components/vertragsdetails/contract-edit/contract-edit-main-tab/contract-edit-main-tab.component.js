import moment from 'moment';
import * as angular from 'angular';
import template from './contract-edit-main-tab.template.html';

class ContractEditMainTabCtrl {
  constructor($uibModal, $interpolate, Vertrag, Vertragspartner, Vertragsart, Status, Kuendigungsoption, Kategorien, User) { // eslint-disable-line max-len
    Object.assign(this, {
      $uibModal,
      $interpolate,
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

    this.janeinOpts = [{
      id: 1,
      name: 'Ja',
    }, {
      id: 0,
      name: 'Nein',
    }];
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
      }).$promise.then((values) => {
        this.koordinatorOpts = [{
          id: null,
          name: '(keiner)',
        }, ...values.map(n => ({ id: n.id, name: `${n.nachname}, ${n.vorname} (${n.email})` }))];
        this.koordinator = values.find(n => n.id === this.vertrag.idKoordinator);
      });

      this.Vertragspartner.partnerFirmen().$promise
        .then((values) => {
          values.map((n) => {
            if (n.kundennr) {
              n.firmenname = `${n.firmenname} (${n.kundennr})`; // eslint-disable-line no-param-reassign
            }

            return n;
          });

          this.vertragspartnerOpts = values;

          if ({}.hasOwnProperty.call(this.vertrag, 'idVertragspartner') && this.vertrag.idVertragspartner) {
            this.selectedVertragspartner = this.vertragspartnerOpts.find(n => n.id === this.vertrag.idVertragspartner); // eslint-disable-line max-len
          }
        });

      if (this.vertrag.laufzeitende) {
        this.unbegrenzteLaufzeit = false;
      } else {
        this.unbegrenzteLaufzeit = true;
      }

      this.onKuendigungsdatumChanged();
    });
  }

  onKuendigungsfristChange() {
    if (this.vertrag.kuendigungsfrist === null && this.vertrag.laufzeitende) {
      this.vertrag.kuendigungsdatum = null;
    } else {
      this.vertrag.kuendigungsdatum = moment(this.vertrag.laufzeitende).subtract(this.vertrag.kuendigungsfrist, 'months').toDate();
    }
    this.onKuendigungsdatumChanged();
  }

  onLaufzeitendeChange() {
    if (this.vertrag.kuendigungsfrist === null && this.vertrag.laufzeitende) {
      this.vertrag.kuendigungsdatum = null;
    } else {
      this.vertrag.kuendigungsdatum = moment(this.vertrag.laufzeitende).subtract(this.vertrag.kuendigungsfrist, 'months').toDate();
    }
    this.onKuendigungsdatumChanged();
  }

  onUnbegrenzteLaufzeitChanged() {
    if (this.unbegrenzteLaufzeit) {
      this.vertrag.laufzeitende = null;
      this.onKuendigungsdatumChanged();
    }
  }

  onKuendigungsdatumChanged() {
    const temp = this.$interpolate("{{kuendigungsdatum | date: 'dd.MM.yyyy'}}")({ kuendigungsdatum: this.vertrag.kuendigungsdatum });
    this.kuendigungsdatum = temp === 'null' ? 'kein Datum' : temp;
  }


  addVertragspartner(idVertragspartner) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'vertragspartnerEdit',
      resolve: {
        vertragspartner: () => {
          if (idVertragspartner) {
            return { id: idVertragspartner };
          }
          return {};
        },
      },
    });

    modalInstance.result.then((vertragspartner) => {
      this.vertragspartnerOpts = this.vertragspartnerOpts.filter(n => n.id !== vertragspartner.id); // eslint-disable-line max-len
      const newVertragspartner = { id: vertragspartner.id, firmenname: {}.hasOwnProperty.call(vertragspartner, 'kundennr') ? `${vertragspartner.firmenname} (${vertragspartner.kundennr})` : vertragspartner.firmenname };
      this.vertragspartnerOpts.push(newVertragspartner);
      this.selectedVertragspartner = newVertragspartner;
      this.vertrag.idVertragspartner = newVertragspartner.id;
      this.vertrag.vertragspartner = vertragspartner;
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }
}

angular.module('contractEditMainTab')
  .component('contractEditMainTab', {
    template,
    bindings: {
      vertrag: '=',
    },
    controller: ContractEditMainTabCtrl,
  });
