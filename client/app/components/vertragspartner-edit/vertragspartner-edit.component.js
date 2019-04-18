import * as angular from 'angular';
import template from './vertragspartner-edit.template.html';

class VertragspartnerEditCtrl {
  constructor(Vertragspartner) {
    Object.assign(this, { Vertragspartner });
  }

  $onInit() {
    if ('id' in this.resolve.vertragspartner) {
      this.vertragspartner = this.Vertragspartner.findById({ id: this.resolve.vertragspartner.id }); // eslint-disable-line max-len
      this.anlegen = 'ändern';
    } else {
      this.vertragspartner = {};
      this.anlegen = 'anlegen';
    }
  }

  cancel() {
    this.modalInstance.dismiss('cancel');
  }

  save() {
    if ('id' in this.vertragspartner) {
      return this.Vertragspartner.prototype$updateAttributes({ id: this.vertragspartner.id }, this.vertragspartner, (value) => { // eslint-disable-line max-len
        this.modalInstance.close(value);
      });
    }

    return this.Vertragspartner.create({}, this.vertragspartner, (value) => {
      // success
      this.modalInstance.close(value);
    }, (httpResponse) => {
      console.error(httpResponse); // eslint-disable-line no-console
    });
  }
}

angular.module('vertragspartnerEdit')

.component('vertragspartnerEdit', {
  template,
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller: VertragspartnerEditCtrl,
});
