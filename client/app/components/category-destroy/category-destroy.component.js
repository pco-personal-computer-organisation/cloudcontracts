import * as angular from 'angular';
import template from './category-destroy.template.html';

class CategoryDestroyCtrl {
  constructor(Kategorien) {
    Object.assign(this, { Kategorien });
  }

  $onInit() {
    this.kategorie = this.Kategorien.findById({ id: this.resolve.id });
  }

  destroy() {
    this.modalInstance.close();
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('categoryDestroy')

.component('categoryDestroy', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: CategoryDestroyCtrl,
});
