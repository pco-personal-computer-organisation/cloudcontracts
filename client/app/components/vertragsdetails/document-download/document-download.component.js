import * as angular from 'angular';
import template from './document-download.template.html';

class DocumentDownloadCtrl {
  constructor($http, FileSaver) {
    Object.assign(this, { $http, FileSaver });
  }

  $onInit() {
    this.dokument = angular.copy(this.resolve.dokument);

    this.$http.get(`/api/Dokumente/download/${this.dokument.id}`, { responseType: 'blob' })
    .then((res) => {
      // success
      this.FileSaver.saveAs(res.data, this.dokument.dateiname, true);
      this.modalInstance.dismiss('done');
    }, (res) => {
      console.error('err:', res); // eslint-disable-line no-console
    });
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('documentDownload')

.component('documentDownload', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: DocumentDownloadCtrl,
});
