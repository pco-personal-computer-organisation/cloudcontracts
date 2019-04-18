import moment from 'moment';
import * as angular from 'angular';
import template from './contract-view-asset-tab.template.html';

class ContractViewAssetTabCtrl {
  constructor($uibModal, NgTableParams, Vertragsgegenstaende, User) {
    Object.assign(this, { $uibModal, NgTableParams, Vertragsgegenstaende, User, moment });

    this.user = this.User.getCurrent();
  }

  $onInit() {
    const promise = this.vertrag.$promise || Promise.resolve(this.vertrag);
    promise.then(() => {
      this.tableParams = new this.NgTableParams({
        sorting: { nummer: 'asc' },
      }, {
        getData: (params) => {
          const sorting = params.sorting();
          Object.keys(sorting).reverse().map((n) => {
            this.vertrag.vertragsgegenstaende.sort((a, b) => {
              if (a[n] < b[n]) {
                return sorting[n] === 'asc' ? -1 : 1;
              } else if (a[n] > b[n]) {
                return sorting[n] === 'asc' ? 1 : -1;
              }

              return 0;
            });

            return n;
          });

          params.total(this.vertrag.vertragsgegenstaende.length);
          return this.vertrag.vertragsgegenstaende;
        },
      });
    });
  }

  edit(id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'vertragsgegenstandEdit',
      resolve: {
        vertragsgegenstand: () => {
          if (id) {
            return this.vertrag.vertragsgegenstaende.find(gegenstand => gegenstand.id === id);
          }

          return { // on new item, nummer has to be empty and set
            idVertrag: this.vertrag.id,
            nummer: '',
          };
        },
      },
    });

    modalInstance.result.then((vertragsgegenstand) => {
      const idx = this.vertrag.vertragsgegenstaende.findIndex(n => n.id === vertragsgegenstand.id); // eslint-disable-line max-len
      if (idx === -1) {
        this.vertrag.vertragsgegenstaende.push(vertragsgegenstand);
      } else {
        this.vertrag.vertragsgegenstaende[idx] = vertragsgegenstand;
      }

      this.tableParams.reload();
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }

  destroyGegenstand(id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'gegenstandDestroy',
      resolve: {
        gegenstand: () => this.vertrag.vertragsgegenstaende.find(n => n.id === id),
      },
    });

    modalInstance.result.then((gegenstand) => {
      this.Vertragsgegenstaende.destroyById({
        id: gegenstand.id,
      }, (/* value, responseHeaders */) => {
        this.vertrag.vertragsgegenstaende = this.vertrag.vertragsgegenstaende.filter(n => n !== gegenstand); // eslint-disable-line max-len

        this.tableParams.reload();
      }, (httpResponse) => {
        console.error('error', httpResponse); // eslint-disable-line no-console
      });
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }
}

angular.module('contractViewAssetTab')

.component('contractViewAssetTab', {
  template,
  bindings: {
    vertrag: '=',
  },
  controller: ContractViewAssetTabCtrl,
});
