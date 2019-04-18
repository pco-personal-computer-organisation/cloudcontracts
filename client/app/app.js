/* eslint-disable import/first */

import 'babel-polyfill';
import moment from 'moment';
import * as $ from 'jquery'; // eslint-disable-line no-unused-vars
import * as angular from 'angular';
import '../assets/css/_bs.scss';
import 'angular-ui-bootstrap/dist/ui-bootstrap-csp.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import 'csshake/dist/csshake.css';
import 'ng-table/bundles/ng-table.css';
import 'select2/dist/css/select2.css';
import 'ui-select/dist/select.css';
import 'angular-route';
import 'angular-resource';
import 'angular-translate';
import 'angular-animate';
import 'angular-sanitize';
import 'angular-i18n/angular-locale_de-de';
import './../assets/css/pcocm4it.css';
import './lb-services';
import './components/daterangepicker_wrapper/daterangepicker_wrapper.component';
import './components/nav-bar';
import './components/about';
import './components/datenschutz-erklaerung';
import './components/berichte';
import './components/password-change';
import './components/dashboard';
import './components/category-destroy';
import './components/login-page';
import './components/partner-destroy';
import './components/termine';
import './components/user-destroy';
import './components/user-edit';
import './components/user-lock';
import './components/users-list';
import './components/user-unlock';
import './components/vertrag-destroy';
import './components/vertragsdetails';
import './components/vertragsliste';
import './components/vertragspartner-edit';
import './components/vertragspartner';

/* eslint-disable no-param-reassign */

if (!String.prototype.includes) { // polyfill for IE, Opera and Safari; found here: https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/String/includes#Polyfill
  String.prototype.includes = (search, start) => { // eslint-disable-line no-extend-native, max-len, // TODO: remove in favor of babel?
    if (typeof start !== 'number') {
      start = 0;
    }

    return (start + search.length > this.length) ? false : this.indexOf(search, start) !== -1;
  };
}

angular.module('cloudContracts', ['navBar', 'about', 'berichte', 'passwordChange', 'dashboard', 'categoryDestroy', 'loginPage', 'partnerDestroy', 'termine', 'userDestroy', 'userEdit',
  'userLock', 'userUnlock', 'vertragDestroy', 'contractEdit', 'contractView', 'vertragsliste', 'vertragspartnerEdit', 'vertragspartner',
  'ngRoute', 'lbServices', 'ngResource', 'pascalprecht.translate', 'ngAnimate', 'ngSanitize', 'daterangepicker', 'usersList', 'datenschutzErklaerung']) // eslint-disable-line no-undef

  .filter('daterange', () => (items, from, to) => {
    const range = moment.range(from, to);
    const result = [];

    items.map((item) => {
      if (range.contains(item)) {
        result.push(item);
      }
      return item;
    });

    return result;
  })

  .directive('prime', () => {
    console.log('No starship may interfere with the normal development of any alien life or society.'); // eslint-disable-line no-console
  })

  // http://stackoverflow.com/a/22720438
  /*
  .directive('clickAndDisable', () => { // eslint-disable-line arrow-body-style
    return {
      scope: {
        clickAndDisable: '&',
      },
      link: (scope, iElement) => {
        iElement.bind('click', () => {
          iElement.prop('disabled', true);
          scope.clickAndDisable().finally(() => {
            iElement.prop('disabled', false);
          });
        });
      },
    };
  })
  */

  .directive('clickAndDisable', ['$parse', ($parse) => { // eslint-disable-line arrow-body-style
    return {
      restrict: 'A',
      compile: ($element, attr) => { // from anuglar's ng-click
        const fn = $parse(attr.clickAndDisable, /* interceptorFn */ null, /* expensiveChecks */ true); // eslint-disable-line max-len
        return function ngEventHandler(scope, element) {
          element.on('click', (event) => {
            const callback = () => fn(scope, { $event: event });
            element.prop('disabled', true);

            scope.$apply(callback).$promise.then(() => {
              element.prop('disabled', false);
            });
            element.prop('disabled', false);
          });
        };
      },
    };
  }])

  .directive('unsavedChanges', () => { // eslint-disable-line arrow-body-style
    return {
      restrict: 'A',
      require: '^form',
      link: (scope, element) => {
        scope.$watch(`${element.attr('name')}.$dirty`, (dirty) => {
          if (dirty) {
            scope.$root.preventNavigation();
          } else {
            scope.$root.allowNavigation();
          }
        });
      },
    };
  })

  .directive('required', () => { // eslint-disable-line arrow-body-style
    return {
      restrict: 'A',
      terminal: true,
      compile: () => { // eslint-disable-line arrow-body-style
        return {
          pre: (scope, element) => {
            const input = element;
            const label = angular.element(`label[for='${input.attr('name')}']`);
            const formScope = scope.$ctrl[input.closest('form').attr('name').substring(6)]; // TODO: maybe use $parse from angular?
            const formGroup = label.closest('.form-group');

            input.bind('blur', () => {
              if (formScope) {
                formGroup.toggleClass('has-error', formScope[input.attr('name')].$invalid);
              }
            });

            label.append(' <span class="required">*</span>');
          },
        };
      },
    };
  })

  .directive('inputFocusFunction', () => { // eslint-disable-line arrow-body-style
    return {
      restrict: 'A',
      link: (scope, element, attr) => {
        scope.fn[attr.inputFocusFunction] = () => {
          element.focus();
        };
      },
    };
  })

  .controller('AppCtrl', ['$scope', '$route', ($scope, $route) => {
    $scope.$route = $route;
  }])

  .config(['$httpProvider', '$routeProvider', '$locationProvider', '$translateProvider', ($httpProvider, $routeProvider, $locationProvider, $translateProvider) => {
    $routeProvider
      .when('/login/', {
        template: '<login-page></login-page>',
        isLogin: true,
      })
      .when('/dashboard/', {
        template: '<nav-bar></nav-bar><dashboard></dashboard>',
      })
      .when('/users/', {
        template: '<nav-bar></nav-bar><users-list></users-list>',
      })
      .when('/vertragsliste/:kategorieid?/', {
        template: '<nav-bar></nav-bar><vertragsliste></vertragsliste>',
      })
      .when('/vertragspartner/', {
        template: '<nav-bar></nav-bar><vertragspartner></vertragspartner>',
      })
      .when('/berichte/', {
        template: '<nav-bar></nav-bar><berichte></berichte>',
      })
      /*
      .when('/termine/', {
        template: '<nav-bar></nav-bar><termine></termine>',
      })
      */
      .when('/vertrag/:vertragid?/edit/:kategorieid?/', {
        template: '<nav-bar></nav-bar><contract-edit></contract-edit>',
      })
      .when('/vertrag/:vertragid/', {
        template: '<nav-bar></nav-bar><contract-view></contract-view>',
      })
      .otherwise({ redirectTo: '/dashboard/' });

    // configure html5 to get links working on jsfiddle
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: true,
      rewriteLinks: true,
    });

    $httpProvider.interceptors.push(['$q', '$location', 'LoopBackAuth', ($q, $location, LoopBackAuth) => { // eslint-disable-line arrow-body-style, max-len
      return {
        responseError: (rejection) => {
          if (rejection.status === 401) {
            // Now clearing the loopback values from client browser for safe logout...
            LoopBackAuth.clearUser();
            LoopBackAuth.clearStorage();
            if ($location.path() !== '/login/') {
              $location.nextAfterLogin = $location.path();
            } else {
              $location.nextAfterLogin = '/';
            }
            $location.path('/login/');
          }

          return $q.reject(rejection);
        },
      };
    }]);

    $translateProvider.translations('de', {
    });
    $translateProvider.preferredLanguage('de'); // $translateProvider.determinePreferredLanguage();
  }])

  .config(['uiSelectConfig', (uiSelectConfig) => {
    uiSelectConfig.theme = 'bootstrap';
  }])

  .config(['$qProvider', ($qProvider) => {
    $qProvider.errorOnUnhandledRejections(false);
  }])

  /*
  .config(['$compileProvider', ($compileProvider) => {
    $compileProvider.debugInfoEnabled(false);
  }])
  */

  /* eslint-disable no-underscore-dangle */
  .run(['$rootScope', '$location', 'LoopBackAuth', ($rootScope, $location, LoopBackAuth) => {
    let _preventNavigation = false; // http://www.markcampbell.me/tutorial/2013/10/08/preventing-navigation-in-an-angularjs-project.html
    let _preventNavigationUrl = null;

    $rootScope.allowNavigation = () => {
      _preventNavigation = false;
    };

    $rootScope.preventNavigation = () => {
      _preventNavigation = true;
      _preventNavigationUrl = $location.absUrl();
    };

    // enumerate routes that don't need authentication
    const routesThatDontRequireAuth = ['/login/'];

    // check if current location matches route
    const routeClean = route => routesThatDontRequireAuth.find(noAuthRoute => route.startsWith(noAuthRoute)); // eslint-disable-line max-len

    $rootScope.$on('$routeChangeStart', () => {
      // if route requires auth and user is not logged in
      if (!routeClean($location.path()) && LoopBackAuth.accessTokenId === null) {
        // redirect back to login
        $location.nextAfterLogin = $location.path();
        $location.path('/login/');
      }
    });

    $rootScope.$on('$locationChangeStart', (event, newUrl, oldUrl) => {
      // Allow navigation if our old url wasn't where we prevented navigation from
      if (_preventNavigationUrl !== oldUrl || _preventNavigationUrl === null) {
        $rootScope.allowNavigation();
        return;
      }

      if (_preventNavigation && !confirm('Sie haben Ihre Änderungen noch nicht gespeichert. Wollen Sie die Seite trotzdem verlassen?')) { // eslint-disable-line no-alert, no-undef, no-restricted-globals
        event.preventDefault();
      } else {
        $rootScope.allowNavigation();
      }
    });

    // Take care of preventing navigation out of our angular app
    window.onbeforeunload = () => { // eslint-disable-line no-undef, arrow-body-style
      return (_preventNavigation && $location.absUrl() === _preventNavigationUrl) ? 'Sie haben Ihre Änderungen noch nicht gespeichert. Wollen Sie die Seite trotzdem verlassen?' : null;
    };
  }]);
/* eslint-enable no-underscore-dangle */
