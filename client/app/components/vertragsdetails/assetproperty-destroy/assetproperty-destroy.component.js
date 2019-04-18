import * as angular from 'angular';
import template from './assetproperty-destroy.template.html';

class AssetPropertyDestroyCtrl {
  constructor(AssetProperty) {
    Object.assign(this, { AssetProperty });
  }

  $onInit() {
    this.assetproperty = angular.copy(this.resolve.assetproperty);
  }

  destroy() {
    if (this.assetproperty.id) {
      this.AssetProperty.deleteById({ id: this.assetproperty.id });
    }

    this.modalInstance.close(this.assetproperty);
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('assetpropertyDestroy')

.component('assetPropertyDestroy', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: AssetPropertyDestroyCtrl,
});
