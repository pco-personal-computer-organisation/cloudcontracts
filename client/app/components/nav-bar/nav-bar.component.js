import * as angular from 'angular';
import template from './nav-bar.template.html';

class NavBarCtrl {
  constructor($location, $uibModal, $routeParams, User, Vertrag) {
    Object.assign(this, {
      $location,
      $uibModal,
      $routeParams,
      User,
      Vertrag,
    });

    this.searchModel = this.$routeParams.search;
  }

  $onInit() {
    this.user = this.User.getCurrent();
    this.updateDashCount();
  }

  updateDashCount() {
    this.dashboardCount = this.Vertrag.dashboardCount();
  }

  isActive(viewLocation) {
    return viewLocation === this.$location.path();
  }

  logout() {
    this.User.logout();
    this.$location.path('login/');
  }

  about() {
    this.$uibModal.open({
      animation: true,
      component: 'about',
    });
  }

  datenschutzErklaerung() {
    this.$uibModal.open({
      animation: true,
      component: 'datenschutzErklaerung',
    });
  }

  changePassword() {
    this.$uibModal.open({
      animation: true,
      component: 'passwordChange',
    });
  }

  search(s) {
    this.$location.path('/vertragsliste/').search({ search: s });
  }

  editUser() {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'userEdit',
      resolve: {
        user: () => this.user,
      },
    });

    modalInstance.result.then(() => {
      this.user = this.User.getCurrent();
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }
}

angular.module('navBar')
  .component('navBar', {
    template,
    controller: NavBarCtrl,
  });
