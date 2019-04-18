import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import './../../lb-services';
import './../category-sidebar';

angular.module('vertragsliste', ['ngRoute', 'lbServices', 'ui.bootstrap', 'ngTable', 'categorySidebar']);
