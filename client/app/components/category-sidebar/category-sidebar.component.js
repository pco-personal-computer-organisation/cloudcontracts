import * as angular from 'angular';
import template from './category-sidebar.template.html';
import menuTemplate from './category-menu.template.html';

/* eslint-disable no-param-reassign */

class ContractEditCtrl {
  constructor($templateCache, $location, $routeParams, $uibModal, $timeout, User, Kategorien) {
    Object.assign(this, { $location, $routeParams, $uibModal, $timeout, User, Kategorien });

    this.popoverStatus = [];

    $templateCache.put('category-menu.template.html', menuTemplate);
  }

  $onInit() {
    this.user = this.User.getCurrent();

    this.kategorien = this.Kategorien.find();

    if ({}.hasOwnProperty.call(this.$routeParams, 'kategorieid')) {
      this.currentCategory = this.$routeParams.kategorieid;
    }
  }

  removeCategory(id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'categoryDestroy',
      resolve: {
        id,
      },
    });

    modalInstance.result.then(() => {
      this.Kategorien.deleteById({ id }, () => {
        this.$location.path('/vertragsliste/');
      });
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }

  addCategory(s) {
    this.Kategorien.create({}, { name: s }, (value) => {
      this.kategorien.splice(0, 0, value);
      this.newCategory = '';
    });
  }

  saveCategory(o) {
    this.Kategorien.prototype$updateAttributes({ id: o.id }, o, () => {
      delete o.editing;
    });
  }

  popoverShow(id, show, parent) {
    if (!(id in this.popoverStatus)) {
      this.popoverStatus[id] = {};
    }
    if (show) {
      this.popoverStatus[id][parent] = show;
      this.popover[id] = show;
    } else {
      delete this.popoverStatus[id][parent];
      this.$timeout(() => {
        if (Object.keys(this.popoverStatus[id]).length === 0) {
          this.popover[id] = show;
        }
      }, 300);
    }
  }
}

angular.module('categorySidebar')

.component('categorySidebar', {
  template,
  controller: ContractEditCtrl,
});
