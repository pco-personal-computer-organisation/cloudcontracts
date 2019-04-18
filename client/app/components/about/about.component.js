import * as angular from 'angular';
import template from './about.template.html';

if (!Object.values) { // Object.values polyfill
  Object.values = o => Object.keys(o).map(n => o[n]);
}

class AboutCtrl {
  constructor(User) {
    Object.assign(this, { User });
  }

  $onInit() {
    this.User.version((version) => {
      this.version = Object.values(JSON.parse(JSON.stringify(version))).join('');
    });
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('about')
.component('about', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: AboutCtrl,
});
