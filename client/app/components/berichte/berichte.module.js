import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap';
import './../../lb-services';
import './bericht-monatliche-kosten';
import './bericht-vertragsassets';
import './bericht-vertrag-mit-assets';
import './bericht-vertrag-mit-kosten';
import './bericht-vertrag-mit-slas';
import './bericht-vertraege';

angular.module('berichte', ['ngRoute', 'lbServices', 'ui.bootstrap', 'berichtMonatlicheKosten', 'berichtVertragsassets', 'berichtVertragMitAssets', 'berichtVertragMitKosten', 'berichtVertragMitSlas', 'berichtVertraege']);
