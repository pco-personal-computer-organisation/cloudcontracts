import * as angular from 'angular';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import './../../lb-services';


angular.module('usersList', ['lbServices', 'ui.bootstrap', 'ngTable']);
