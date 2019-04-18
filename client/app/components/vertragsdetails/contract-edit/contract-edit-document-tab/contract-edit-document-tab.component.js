import moment from 'moment';
import * as angular from 'angular';
import template from './contract-edit-document-tab.template.html';

// from https://stackoverflow.com/a/9229821
const uniqBy = (a, key) => {
  const seen = new Set();
  return a.filter((item) => {
    const k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
};

class ContractEditDocumentTabCtrl {
  constructor($uibModal, NgTableParams, User, Vertrag, Dokumente, Dokumenttyp, Error) {
    Object.assign(this, {
      $uibModal,
      NgTableParams,
      User,
      Vertrag,
      Dokumente,
      Dokumenttyp,
      Error,
      moment,
    });

    this.user = this.User.getCurrent();
  }

  $onInit() {
    (this.vertrag.$promise || Promise.resolve(this.vertrag))
      .then(() => {
        this.tableParams = new this.NgTableParams({}, {
          getData: params => this.Dokumente.find({ // TODO: to loopback
            filter: {
              include: ['user'],
              where: {
                idVertrag: this.vertrag.id,
                idTyp: this.type,
              },
              order: ['dateiname ASC', 'datum DESC'],
            },
          }).$promise
            .then((dokumente) => {
              const items = uniqBy(dokumente, n => n.dateiname);
              params.total(items.length);
              return items;
            }),
        });
      });
  }

  upload() {
    this.$uibModal.open({
      animation: true,
      component: 'documentUpload',
      resolve: {
        dokument: () => ({
          idVertrag: this.vertrag.id,
          idTyp: this.type,
        }),
      },
    }).result
      .then(() => this.tableParams.reload())
      .catch(() => {});
  }

  documentHistorie(doc) {
    this.$uibModal.open({
      animation: true,
      component: 'documentHistory',
      resolve: { dokument: () => doc },
    }).result
      .then(null)
      .catch(() => {});
  }

  downloadDocument(doc) {
    this.$uibModal.open({
      animation: false,
      component: 'documentDownload',
      resolve: { dokument: () => doc },
    }).result
      .then(null)
      .catch(() => {});
  }

  removeDocument(data) {
    this.$uibModal.open({
      animation: true,
      component: 'documentRemove',
      resolve: { dokument: () => data },
    }).result
      .then(dokument => this.Dokumente.destroyById({ id: dokument.id }))
      .then(() => this.tableParams.reload())
      .catch(httpResponse => console.error('error', httpResponse)); // eslint-disable-line no-console
  }
}

angular.module('contractEditDocumentTab')
  .component('contractEditDocumentTab', {
    template,
    bindings: {
      vertrag: '=',
      type: '<',
    },
    controller: ContractEditDocumentTabCtrl,
  });
