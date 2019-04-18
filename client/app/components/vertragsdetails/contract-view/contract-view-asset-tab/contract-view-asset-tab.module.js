import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import 'ui-select';
import './../../../../lb-services';
import './../../assetproperty-destroy';
import './../../gegenstand-destroy';
import './../../vertragsgegenstand-edit';

angular.module('contractViewAssetTab', ['ngRoute', 'lbServices', 'ui.bootstrap', 'ngTable', 'assetpropertyDestroy', 'gegenstandDestroy', 'vertragsgegenstandEdit']);
