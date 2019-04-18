import * as angular from 'angular';
import template from './berichte.template.html';

class BerichteCtrl {
  constructor() {
    this.menuEntry = 1;
  }
}

angular.module('berichte')
  .component('berichte', {
    template,
    controller: BerichteCtrl,
  });
