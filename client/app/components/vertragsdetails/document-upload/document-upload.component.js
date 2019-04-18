import * as angular from 'angular';
import template from './document-upload.template.html';

class DocumentUploadCtrl {
  constructor($timeout, Upload, Error) {
    Object.assign(this, { $timeout, Upload, Error });

    this.file = {};
    this.uploading = false;
  }

  $onInit() {
    this.dokument = this.resolve.dokument;
  }

  upload() {
    this.uploading = true;

    this.Upload.upload({
      url: `/api/Dokumente/upload/${this.dokument.idVertrag}`,
      data: { file: this.file },
    })
      .then((response) => {
        this.$timeout(() => {
          if (response.status === 200) {
            this.modalInstance.close(response.data);
          } else {
            if (!response.statusText) {
              response.statusText = 'Zeitüberschreitung beim Hochladen!'; // eslint-disable-line no-param-reassign
            }

            Error.message(response.statusText);
          }
          this.uploading = false;
        });
      }, undefined, (evt) => {
        this.progress = Math.round((evt.loaded / evt.total) * 100);
      })
      .catch((httpResponse) => {
        this.uploading = false;
        Error.message(httpResponse.error.message);
      });
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('documentUpload')
  .component('documentUpload', {
    template,
    bindings: {
      modalInstance: '<',
      resolve: '<',
    },
    controller: DocumentUploadCtrl,
  });
