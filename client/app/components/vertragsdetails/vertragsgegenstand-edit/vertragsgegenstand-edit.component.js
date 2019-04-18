import * as angular from 'angular';
import template from './vertragsgegenstand-edit.template.html';

class VertragsgegenstandEditCtrl {
  constructor($uibModal, AssetProperty, Vertragsgegenstaende, User) {
    Object.assign(this, { $uibModal, AssetProperty, Vertragsgegenstaende, User });

    this.user = this.User.getCurrent();
  }

  $onInit() {
    this.vertragsgegenstand = angular.copy(this.resolve.vertragsgegenstand);

    this.assetProperties = this.AssetProperty.find({
      filter: {
        where: {
          idVertragsgegenstand: this.vertragsgegenstand.id ? this.vertragsgegenstand.id : -1,
        },
      },
    });

    this.assetPropertyParams = this.AssetProperty.parameterList();
  }

  addAssetProperty() {
    if (this.newAssetProperty.name && this.newAssetProperty.wert) {
      this.assetProperties.push(this.newAssetProperty);
      this.newAssetProperty = {};
      angular.element('input[name="assetName"]').focus();
    }
  }

  destroyAssetProperty(name) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'assetPropertyDestroy',
      resolve: {
        assetproperty: () => this.assetProperties.find(n => n.name === name),
      },
    });

    modalInstance.result.then((assetproperty) => {
      this.assetProperties = this.assetProperties.filter(n => n !== assetproperty);
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }

  save() {
    if (this.newAssetProperty && this.newAssetProperty.name && this.newAssetProperty.name.length > 0) { // eslint-disable-line max-len
      this.addAssetProperty();
    }

    return this.Vertragsgegenstaende.upsert({}, this.vertragsgegenstand, (upsertedVertragsgegenstand) => { // eslint-disable-line max-len
      this.assetProperties.map((assetProperty) => {
        assetProperty.idVertragsgegenstand = upsertedVertragsgegenstand.id; // eslint-disable-line no-param-reassign, max-len
        this.AssetProperty.upsert(assetProperty, () => {
          // success
        }, (httpResponse) => {
          // error
          console.error(httpResponse); // eslint-disable-line no-console
        });

        return assetProperty;
      });
      this.modalInstance.close(upsertedVertragsgegenstand);
    }, (httpResponse) => {
      console.error(httpResponse); // eslint-disable-line no-console
    });
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }
}

angular.module('vertragsgegenstandEdit')

.component('vertragsgegenstandEdit', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: VertragsgegenstandEditCtrl,
});
