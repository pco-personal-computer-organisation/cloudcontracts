import * as angular from 'angular';
import template from './document-history.template.html';

class DocumentHistoryCtrl {
  constructor($uibModal, Dokumente, User) {
    Object.assign(this, { $uibModal, Dokumente, User });

    this.user = this.User.getCurrent();
  }

  $onInit() {
    this.dokument = angular.copy(this.resolve.dokument);

    this.dokumente = this.Dokumente.find({ // TODO: to loopback
      filter: {
        include: ['user'],
        where: {
          idVertrag: this.dokument.idVertrag,
          dateiname: this.dokument.dateiname,
        },
        order: ['datum DESC'],
      },
    });
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }

  downloadDocument(doc) {
    const modalInstance = this.$uibModal.open({
      animation: false,
      component: 'documentDownload',
      resolve: {
        dokument: () => doc,
      },
    });

    modalInstance.result.then(null, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }

  removeDocument(data) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'documentRemove',
      resolve: {
        dokument: () => data,
      },
    });

    modalInstance.result.then((doc) => {
      this.Dokumente.destroyById({ id: doc.id }, () => { // TODO: to loopback
        this.dokumente = this.dokumente.filter(n => n !== doc);
      }, (httpResponse) => {
        console.error('error', httpResponse); // eslint-disable-line no-console
      });
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }
}

angular.module('documentHistory')

.component('documentHistory', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: DocumentHistoryCtrl,
});
