import * as angular from 'angular';
import template from './vertragspartner.template.html';

class VertragspartnerCtrl {
  constructor($uibModal, NgTableParams, Vertragspartnerliste, Vertragspartner, $location, User) {
    Object.assign(this, { $uibModal, NgTableParams, Vertragspartnerliste, Vertragspartner, $location, User }); // eslint-disable-line max-len

    this.user = this.User.getCurrent();
  }

  $onInit() {
    this.tableParams = new this.NgTableParams({
      group: 'firmenname',
    }, {
      groupOptions: { isExpanded: false },
      getData: (params) => {
        let filter = angular.copy(this.tableParams.filter());

        filter = Object.keys(filter).map(i => ({ like: `%${filter[i]}%` }));

        const paramsSorting = this.tableParams.sorting();
        let sorting = Object.keys(paramsSorting).map(key => `${key} ${paramsSorting[key].toUpperCase()}`);

        if (sorting.length === 0) {
          sorting = undefined;
        }
        if (filter.length === 0) {
          filter = undefined;
        }

        return this.Vertragspartnerliste.find({
          filter: {
            order: sorting,
            where: filter,
          },
        }).$promise.then((values) => {
          params.total(values.length);
          return values;
        });
      },
    });
  }

  edit(idVertragspartner) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'vertragspartnerEdit',
      resolve: {
        vertragspartner: () => { // eslint-disable-line arrow-body-style
          return idVertragspartner ? { id: idVertragspartner } : {};
        },
      },
    });

    modalInstance.result.then(() => {
      this.tableParams.reload();
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }

  destroyPartner(id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'partnerDestroy',
      resolve: {
        vertragspartner: () => id,
      },
    });

    modalInstance.result.then((vertragspartner) => {
      this.Vertragspartner.destroyById({ id: vertragspartner }, () => {
        this.tableParams.reload();
      }, (httpResponse) => {
        console.error('error', httpResponse); // eslint-disable-line no-console
      });
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }
}

angular.module('vertragspartner')

.component('vertragspartner', {
  template,
  controller: VertragspartnerCtrl,
});
