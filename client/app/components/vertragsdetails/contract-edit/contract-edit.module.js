import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import 'ui-select';
import './../../../lb-services';
import './contract-edit-main-tab';
import './contract-edit-asset-tab';
import './contract-edit-sla-tab';
import './contract-edit-business-tab';
import './contract-edit-history-tab';
import './contract-edit-document-tab';
import './contract-edit-hierarchy-tab';
import './../../error-message';
import './../../category-sidebar';

angular.module('contractEdit', ['ngRoute', 'lbServices', 'ui.bootstrap', 'errorMessage', 'contractEditMainTab', 'contractEditAssetTab', 'contractEditSlaTab', 'contractEditBusinessTab', 'contractEditHistoryTab', 'contractEditDocumentTab', 'contractEditHierarchyTab', 'categorySidebar']);
