import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import 'ui-select';
import './../../../../lb-services';

angular.module('contractViewHistoryTab', ['ngRoute', 'lbServices', 'ui.bootstrap', 'ngTable', 'ui.select']);
