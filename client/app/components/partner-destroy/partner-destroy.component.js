import async from 'async';
import * as angular from 'angular';
import template from './partner-destroy.template.html';

class PartnerDestroyCtrl {
  constructor(Vertragspartner, Vertrag, Vertragspartnerliste, Error) {
    Object.assign(this, { Vertragspartner, Vertrag, Vertragspartnerliste, Error });
  }

  $onInit() {
    this.vertragspartner = angular.copy(this.resolve.vertragspartner);
    this.vertragspartner = this.Vertragspartner.findById({ id: this.vertragspartner });

    this.vertraegeCount = this.Vertrag.count({ where: { idVertragspartner: this.vertragspartner } }).$promise // eslint-disable-line max-len
    .then((values) => {
      this.inUse = values.count > 0;
      return values.count;
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
    });
  }

  destroy() {
    this.modalInstance.close(this.vertragspartner);
  }

  destroyWithContracts() {
    this.Vertrag.find({
      filter: {
        where: {
          idVertragspartner: this.vertragspartner.id,
        },
      },
    }).$promise
    .then((vertraege) => {
      async.each(vertraege, (vertrag, cb) => {
        this.Vertrag.deleteById({ id: vertrag.id }).$promise
        .then(() => {
          cb(null);
        })
        .catch((err) => {
          cb(err);
        });
      }, (err) => {
        if (err) {
          console.error(err); // eslint-disable-line no-console
          this.Error.message('Es ist ein Fehler aufgetreten.');
        } else {
          this.modalInstance.close(this.vertragspartner);
        }
      });
    });
  }

  destroyAndMoveContracts() {
    if (!{}.hasOwnProperty.call(this, 'selectedItem') || !this.selectedItem || !{}.hasOwnProperty.call(this.selectedItem, 'id') || !this.selectedItem.id) {
      this.Error.message('Bitte wählen Sie einen neuen Vertragspartner aus.');
      return;
    }

    this.Vertrag.updateAll({ where: { idVertragspartner: this.vertragspartner.id } }, { idVertragspartner: this.selectedItem.id }).$promise // eslint-disable-line max-len
    .then(() => {
      this.modalInstance.close(this.vertragspartner);
    })
    .catch((err) => {
      console.error(err); // eslint-disable-line no-console
      this.Error.message('Es ist ein Fehler aufgetreten.');
    });
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('partnerDestroy')

.component('partnerDestroy', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: PartnerDestroyCtrl,
});
