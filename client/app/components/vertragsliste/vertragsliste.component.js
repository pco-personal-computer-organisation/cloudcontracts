import * as angular from 'angular';
import moment from 'moment';
import template from './vertragsliste.template.html';
import daterangeFilterTemplate from '../daterangepicker_wrapper/daterange-filter.template.html';

class VertragslisteCtrl {
  constructor($templateCache, $location, $routeParams, $uibModal, $filter, NgTableParams, Vertragsliste, Kategorien, Laufzeitende, Kuendigungsfrist, Status) { // eslint-disable-line max-len
    Object.assign(this, { $location, $routeParams, $uibModal, $filter, NgTableParams, Vertragsliste, Kategorien, Laufzeitende, Kuendigungsfrist, Status }); // eslint-disable-line max-len

    $templateCache.put('ng-table/filters/daterange-filter.html', daterangeFilterTemplate);

    this.date = { startDate: null, endDate: null };

    this.rangepickerOptions = {
      ranges: {
        '30 Tage': [moment(), moment().add(30, 'days')],
        '60 Tage': [moment(), moment().add(60, 'days')],
        '90 Tage': [moment(), moment().add(90, 'days')],
      },
      showCustomRangeLabel: true,
      locale: {
        format: 'DD.MM.YYYY',
        separator: ' - ',
        applyLabel: 'Anwenden',
        cancelLabel: 'Abbrechen',
        fromLabel: 'Vom',
        toLabel: 'Bis',
        customRangeLabel: 'Andere',
        weekLabel: 'W',
        daysOfWeek: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        monthNames: [
          'Januar',
          'Februar',
          'März',
          'April',
          'Mai',
          'Juni',
          'Juli',
          'August',
          'September',
          'Oktober',
          'November',
          'Dezember',
        ],
        firstDay: 1,
      },
    };

    this.laufzeitende = 0;
    this.kuendigungsfrist = 0;
  }

  $onInit() {
    if ({}.hasOwnProperty.call(this.$routeParams, 'kategorieid')) {
      this.kategorieid = this.$routeParams.kategorieid;
    }

    this.laufzeitendeOpts = this.Laufzeitende.find();

    this.kuendigungsfristOpts = this.Kuendigungsfrist.find();

    this.kategorien = this.Kategorien.find();

    this.statusOpts = this.Status.find().$promise
    .then((status) => {
      status.map((currentValue) => {
        currentValue.title = currentValue.name; // eslint-disable-line no-param-reassign
        delete currentValue.name; // eslint-disable-line no-param-reassign
        return currentValue;
      });

      return status;
    });

    this.tableParams = new this.NgTableParams({
      sorting: { kuendigungsdatum: 'asc' },
      filterOptions: { filterComparator: false },
    }, {
      getData: params => this.getData(params),
    });
  }

  getData(params) {
    const filter = angular.copy(this.tableParams.filter());

    if ({}.hasOwnProperty.call(filter, 'laufzeitende') && {}.hasOwnProperty.call(filter.laufzeitende, 'startDate') && filter.laufzeitende.startDate !== null && {}.hasOwnProperty.call(filter.laufzeitende, 'endDate') && filter.laufzeitende.endDate !== null) {
      filter.laufzeitende = { between: [filter.laufzeitende.startDate.toDate(), filter.laufzeitende.endDate.toDate()] }; // eslint-disable-line max-len
    } else if ({}.hasOwnProperty.call(filter, 'laufzeitende')) {
      delete filter.laufzeitende;
    }

    if ({}.hasOwnProperty.call(filter, 'kuendigungsdatum') && {}.hasOwnProperty.call(filter.kuendigungsdatum, 'startDate') && filter.kuendigungsdatum.startDate !== null && {}.hasOwnProperty.call(filter.kuendigungsdatum, 'endDate') && filter.kuendigungsdatum.endDate !== null) {
      filter.kuendigungsdatum = { between: [filter.kuendigungsdatum.startDate.toDate(), filter.kuendigungsdatum.endDate.toDate()] }; // eslint-disable-line max-len
    } else if ({}.hasOwnProperty.call(filter, 'kuendigungsdatum')) {
      delete filter.kuendigungsdatum;
    }

    Object.keys(filter).map((i) => {
      if (angular.isNumber(filter[i]) || angular.isObject(filter[i])) {
        // do nothing;
      } else if (filter[i].length > 0) {
        filter[i] = { like: `%${filter[i]}%` };
      } else {
        filter[i] = undefined;
      }
      return i;
    });

    if (this.kategorieid) {
      filter.idKategorie = this.kategorieid;
    }

    const paramsSorting = this.tableParams.sorting();
    const sorting = Object.keys(paramsSorting).map(key => `${key} ${paramsSorting[key].toUpperCase()}`);

    return this.Vertragsliste.find({
      filter: {
        order: sorting,
        where: filter,
      },
    }).$promise.then((values) => {
      if ({}.hasOwnProperty.call(this.$routeParams, 'search') && this.$routeParams.search.length > 0) {
        values = this.$filter('filter')(values, this.$routeParams.search); // eslint-disable-line no-param-reassign
      }

      params.total(values.length);
      return values.slice((this.tableParams.page() - 1) * this.tableParams.count(), ((this.tableParams.page() - 1) * this.tableParams.count()) + this.tableParams.count()); // eslint-disable-line max-len
    });
  }

  static dateRangeFromToday(days) {
    return {
      dtFrom: moment().toDate(),
      dtTo: moment().add(days, 'days').toDate(),
    };
  }
}

angular.module('vertragsliste')

.component('vertragsliste', {
  template,
  controller: VertragslisteCtrl,
});
