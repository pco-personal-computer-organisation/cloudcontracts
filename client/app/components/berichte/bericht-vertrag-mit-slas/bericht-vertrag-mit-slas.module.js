import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import 'angular-spinner';
import './../../../lb-services';

angular.module('berichtVertragMitSlas', ['ngRoute', 'lbServices', 'ui.bootstrap', 'ngTable', 'angularSpinner']);
