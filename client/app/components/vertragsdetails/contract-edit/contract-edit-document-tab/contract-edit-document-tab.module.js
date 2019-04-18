import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import 'ng-table/bundles/ng-table';
import 'ui-select';
import './../../../../lb-services';
import './../../document-history';
import './../../document-remove';
import './../../document-upload';
import './../../document-download';

angular.module('contractEditDocumentTab', ['ngRoute', 'lbServices', 'ui.bootstrap', 'ngTable', 'ui.select', 'documentHistory', 'documentRemove', 'documentUpload', 'documentDownload']);
