import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import 'ui-select';
import './../../../../lb-services';
import './../../contract-tree';

angular.module('contractViewHierarchyTab', ['ngRoute', 'lbServices', 'ui.bootstrap', 'ui.select', 'contractTree']);
