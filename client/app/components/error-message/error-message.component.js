import * as angular from 'angular';
import template from './error-message.template.html';

class ErrorMessage {
  /*
  constructor() {
  }
  */

  $onInit() {
    this.err = angular.copy(this.resolve.err);
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('errorMessage')

.component('errorMessage', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: ErrorMessage,
});
