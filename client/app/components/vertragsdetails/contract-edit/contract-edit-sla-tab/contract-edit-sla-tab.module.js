import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import 'ui-select';
import './../../../../lb-services';
import './../../sla-destroy';

angular.module('contractEditSlaTab', ['ngRoute', 'lbServices', 'ui.bootstrap', 'slaDestroy']);
