import moment from 'moment';
import * as angular from 'angular';
import template from './contract-view-history-tab.template.html';

class ContractViewHistoryTabCtrl {
  constructor(NgTableParams, Historie) {
    Object.assign(this, { NgTableParams, Historie, moment });
  }

  $onInit() {
    const promise = this.vertrag.$promise || Promise.resolve(this.vertrag);
    promise.then(() => {
      this.tableParams = new this.NgTableParams({
        group: {
          id: 'desc',
        },
        //sorting: { id: 'desc' },
      }, {
        groupOptions: { isExpanded: false },
        getData: params => this.Historie.find({
          filter: {
            include: ['user'],
            where: {
              idVertrag: this.vertrag.id,
            },
            order: 'datum DESC',
          },
        }).$promise
        .then((data) => {
          const items = [];

          angular.forEach(data, (item) => {
            item.diff = JSON.parse(item.diff); // eslint-disable-line no-param-reassign

            angular.forEach(item.diff, (n) => {
              const translateKind = (kind) => {
                if (kind === 'A') {
                  return 'array change';
                } else if (kind === 'E') {
                  return 'bearbeitet';
                } else if (kind === 'D') {
                  return 'gelöscht';
                } else if (kind === 'N') {
                  return 'hinzugefügt';
                }

                return 'whatever';
              };

              items.push({
                datum: item.datum,
                username: item.user ? item.user.username : null,
                changedmodel: item.changedmodel,
                oldvalue: n.lhs,
                newvalue: n.rhs,
                field: n.path[0],
                action: translateKind(n.kind),
                id: item.id,
              });
            });
          });

          params.total(items.length);
          return items;
        }),
      });
    });
  }

  toggleDetail() {
    this.tableParams.settings().groupOptions.isExpanded = !this.tableParams.settings().groupOptions.isExpanded; // eslint-disable-line max-len
    this.tableParams.reload();
  }
}

angular.module('contractViewHistoryTab')

.component('contractViewHistoryTab', {
  template,
  bindings: {
    vertrag: '=',
  },
  controller: ContractViewHistoryTabCtrl,
});
