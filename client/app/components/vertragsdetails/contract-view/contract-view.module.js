import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import 'ui-select';
import './../../../lb-services';
import './contract-view-main-tab';
import './contract-view-asset-tab';
import './contract-view-sla-tab';
import './contract-view-business-tab';
import './contract-view-history-tab';
import './contract-view-document-tab';
import './contract-view-hierarchy-tab';
import './../../error-message';
import './../../category-sidebar';

angular.module('contractView', ['ngRoute', 'lbServices', 'ui.bootstrap', 'ngTable', 'ui.select', 'contractViewMainTab', 'contractViewAssetTab', 'contractViewSlaTab', 'contractViewBusinessTab', 'contractViewHistoryTab', 'contractViewDocumentTab', 'contractViewHierarchyTab']);
