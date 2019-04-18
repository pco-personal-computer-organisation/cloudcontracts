import * as angular from 'angular';
import './error-message.component';

angular.module('errorMessage')

.factory('Error', ['$uibModal', ($uibModal) => { // eslint-disable-line arrow-body-style
  return {
    message: errMsg => $uibModal.open({
      animation: true,
      component: 'errorMessage',
      resolve: {
        err: () => errMsg,
      },
    }),
  };
}]);
