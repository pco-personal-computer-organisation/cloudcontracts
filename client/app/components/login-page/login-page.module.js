import * as angular from 'angular';
import 'angular-ui-bootstrap';
import './../../lb-services';
import '../datenschutz-erklaerung';
import './login-page.scss';

angular.module('loginPage', ['lbServices', 'ui.bootstrap', 'datenschutzErklaerung']);
