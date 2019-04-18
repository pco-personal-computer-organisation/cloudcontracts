import * as angular from 'angular';
import 'angular-ui-bootstrap';
import 'angular-file-saver';
import './../../../lb-services';

angular.module('documentDownload', ['lbServices', 'ui.bootstrap', 'ngFileSaver']);
