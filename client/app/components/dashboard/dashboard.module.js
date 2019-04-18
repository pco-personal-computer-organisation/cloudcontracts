import * as angular from 'angular';
import 'angular-ui-bootstrap';
import './../../lb-services';
import './vertrag-renew';
import './vertrag-terminate';

angular.module('dashboard', ['lbServices', 'ui.bootstrap', 'vertragTerminate', 'vertragRenew']);
