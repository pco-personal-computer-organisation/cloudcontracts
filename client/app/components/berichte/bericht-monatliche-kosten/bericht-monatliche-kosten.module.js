import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import 'ui-select';
import 'angular-spinner';
import './../../../lb-services';

angular.module('berichtMonatlicheKosten', ['ngRoute', 'lbServices', 'ui.bootstrap', 'ngTable', 'ui.select', 'angularSpinner']);
