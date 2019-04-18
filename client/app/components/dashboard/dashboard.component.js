import Moment from 'moment';
import * as MomentRange from 'moment-range';
import * as angular from 'angular';
import template from './dashboard.template.html';

const moment = MomentRange.extendMoment(Moment);

class DashboardCtrl {
  constructor($filter, $location, $uibModal, $routeParams, Vertrag, Vertragspartner, Vertragsgegenstaende, Dokumente, User) { // eslint-disable-line max-len
    Object.assign(this, {
      $filter,
      $location,
      $uibModal,
      $routeParams,
      Vertrag,
      Vertragspartner,
      Vertragsgegenstaende,
      Dokumente,
      User,
    });

    this.moment = moment;
    this.momentRange = moment.range;
    this.countKuendigung = 5;
    this.countLaufzeit = 5;
    this.ampelOpts = ['gruen', 'gelb', 'rot'];
    this.searchModel = this.$routeParams.search;

    this.user = this.User.getCurrent();
  }

  $onInit() {
    this.Vertrag.vertraegeKuendigung().$promise
      .then((vertraege) => {
        this.vertraegeKuendigung = vertraege.map(vertrag => Object.assign({}, vertrag, {
          kosten: vertrag.kosten
            .map(kosten => `${this.$filter('currency')(kosten.kosten, kosten.waehrung ? kosten.waehrung.name : '')} ${kosten.faelligkeit ? kosten.faelligkeit.name : ''} ${kosten.idFaelligkeit === 8 ? 'zum' : 'ab'} ${this.$filter('date')(kosten.datum, 'dd.MM.yyyy')}`)
            .join(', '),
        }));
      })
      .catch(console.error); // eslint-disable-line no-console

    this.Vertrag.vertraegeLaufzeit().$promise
      .then((vertraege) => {
        this.vertraegeLaufzeit = vertraege.map(vertrag => Object.assign({}, vertrag, {
          kosten: vertrag.kosten
            .map(kosten => `${this.$filter('currency')(kosten.kosten, kosten.waehrung ? kosten.waehrung.name : '')} ${kosten.faelligkeit ? kosten.faelligkeit.name : ''} ${kosten.idFaelligkeit === 8 ? 'zum' : 'ab'} ${this.$filter('date')(kosten.datum, 'dd.MM.yyyy')}`)
            .join(', '),
        }));
      })
      .catch(console.error); // eslint-disable-line no-console

    this.alleVertraege = this.Vertrag.count();
    this.aktiveVertraege = this.Vertrag.count({ where: { idStatus: { lt: 2 } } });
    this.vertragspartnerCount = this.Vertragspartner.count();
    this.gegenstaendeCount = this.Vertragsgegenstaende.count();
    this.dokumenteCount = this.Dokumente.count();
    this.ampel = this.Vertrag.ampel();
  }

  daysDiff(contract, field) {
    return this.momentRange(this.moment(), contract[field]).diff('days');
  }

  loadAmpel(color) {
    return color ? require(`./../../../assets/img/Ampel_${this.ampelOpts[color]}.png`) : undefined; // eslint-disable-line global-require, import/no-dynamic-require
  }

  static checkDate(dt, obj) {
    return moment(dt).subtract(obj) < moment();
  }

  search(s) {
    this.$location.path('/vertragsliste/').search({ search: s });
  }

  terminateContract(id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'vertragTerminate',
      resolve: {
        idVertrag: () => id,
      },
    });

    modalInstance.result.then(() => {
      this.$location.path('/dashboard');
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }

  renewContract(id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'vertragRenew',
      resolve: {
        idVertrag: () => id,
      },
    });

    modalInstance.result.then(() => {
      this.$location.path('/dashboard');
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }
}

angular.module('dashboard')
  .component('dashboard', {
    template,
    controller: DashboardCtrl,
  });
