import * as angular from 'angular';
import template from './document-remove.template.html';

class DocumentRemoveCtrl {
  $onInit() {
    this.dokument = this.resolve.dokument;
  }

  destroy() {
    this.modalInstance.close(this.dokument);
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('documentRemove')

.component('documentRemove', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: DocumentRemoveCtrl,
});
