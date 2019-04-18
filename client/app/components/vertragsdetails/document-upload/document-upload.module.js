import * as angular from 'angular';
import 'angular-ui-bootstrap';
import 'ng-file-upload';
import './../../../lb-services';

angular.module('documentUpload', ['lbServices', 'ui.bootstrap', 'ngFileUpload']);
