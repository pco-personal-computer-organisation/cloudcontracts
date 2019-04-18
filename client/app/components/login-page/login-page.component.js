import * as angular from 'angular';
import template from './login-page.template.html';

class LoginPageCtrl {
  constructor($location, $timeout, $uibModal, User) {
    Object.assign(this, {
      $location,
      $timeout,
      $uibModal,
      User,
    });

    this.shake = false;

    this.credentials = {};
    this.wrongcreds = false;
  }

  reset() {
    this.wrongcreds = false;
  }

  static focusNext(name) {
    angular.element(`input[name="${name}"]`).focus();
  }

  datenschutzErklaerung() {
    this.$uibModal.open({
      animation: true,
      component: 'datenschutzErklaerung',
    });
  }

  login() {
    const creds = angular.copy(this.credentials);

    this.submitted = true;

    if (!creds.email.includes('@')) {
      creds.username = creds.email;
      delete creds.email;
    }

    return this.User.login(creds).$promise
      .then(() => {
        this.wrongcreds = false;
        this.user = this.User.getCurrent();
        this.$location.path('/dashboard/');
      })
      .catch((httpResponse) => {
        if (httpResponse.statusText === 'Unauthorized') {
          this.shake = true;
          this.$timeout(() => {
            this.shake = false;
          }, 1000);
          this.wrongcreds = true;
          this.loginForm.inputEmail.$setValidity('loginFailed', false);

          const inputPassword = angular.element('input[name="inputPassword"]');
          inputPassword.focus();
          inputPassword.select();
        }
      });
  }
}

angular.module('loginPage')
  .component('loginPage', {
    template,
    controller: LoginPageCtrl,
  });
