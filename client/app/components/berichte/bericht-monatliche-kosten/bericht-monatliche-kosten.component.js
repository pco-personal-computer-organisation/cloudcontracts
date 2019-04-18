import moment from 'moment';
import * as angular from 'angular';
import * as XLSX from 'xlsx';

import template from './bericht-monatliche-kosten.template.html';

/* eslint-disable no-param-reassign */

class BerichtMonatlicheKostenCtrl {
  constructor($filter, Bericht, Vertragsart, Status, Kategorien, Vertragspartner, NgTableParams, FileSaver, Blob) { // eslint-disable-line max-len
    Object.assign(this, {
      $filter,
      Bericht,
      Vertragsart,
      Status,
      Kategorien,
      Vertragspartner,
      NgTableParams,
      FileSaver,
      Blob,
    });

    this.dateRange = {
      startDate: moment().subtract(11, 'months').startOf('month'),
      endDate: moment().endOf('month'),
    };

    this.rangepickerOptions = {
      eventHandlers: {
        'apply.daterangepicker': () => this.dynTableParams.reload(),
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

    this.cols = [];
  }

  $onInit() {
    this.vertragsartOpts = this.Vertragsart.find();
    this.statusOpts = this.Status.find();
    this.kategorien = this.Kategorien.find();

    this.Vertragspartner.partnerFirmen().$promise
      .then((values) => {
        values.map((n) => {
          if (n.kundennr) {
            n.firmenname = `${n.firmenname} (${n.kundennr})`;
          }
          return n;
        });

        this.selectedVertragspartner = { firmenname: 'Alle' };
        values.splice(0, 0, this.selectedVertragspartner);
        this.vertragspartnerOpts = values;
      });

    this.dynTableParams = new this.NgTableParams({}, {
      getData: params => this.getData(params),
    });
  }

  getData(params) {
    this.showSpinner = true;

    return this.Bericht.monatlicheKosten({
      filter: {
        where: {
          startDate: this.dateRange.startDate.toDate(),
          endDate: this.dateRange.endDate.toDate(),
          status: this.status,
          idKategorie: this.idKategorie,
          vertragspartner: {}.hasOwnProperty.call(this, 'selectedVertragspartner') && {}.hasOwnProperty.call(this.selectedVertragspartner, 'id') ? this.selectedVertragspartner.id : undefined,
          art: this.art,
        },
      },
    }).$promise
      .then((values) => {
        if (values.length === 0) {
          this.showSpinner = false;
          params.total(0);
          return values;
        }

        this.cols = [];
        this.cols.push({
          field: 'vertragspartner',
          title: 'Vertragspartner',
          show: true,
        });

        const sumValues = { summe: 0 };

        Object.keys(values[0].data).map((item) => {
          sumValues[item] = 0;

          this.cols.push({
            field: item,
            title: moment(item, 'YYYY-MM').format('MM/YYYY'),
            show: true,
          });

          return item;
        });

        this.cols.push({
          field: 'summe',
          title: 'Summe',
          show: true,
        });
        values = values.map((item) => {
          const newData = {};
          Object.keys(item.data).map((key) => {
            sumValues[key] += item.data[key];
            sumValues.summe += item.data[key];

            newData[key] = this.$filter('currency')(item.data[key]);
            return key;
          });

          newData.vertragspartner = item.vertragspartner;
          newData.summe = this.$filter('currency')(item.summe);

          return newData;
        });

        Object.keys(sumValues).map((key) => {
          sumValues[key] = this.$filter('currency')(sumValues[key]);
          return key;
        });

        sumValues.vertragspartner = 'Summe';

        values.push(sumValues);

        this.showSpinner = false;

        params.total(values.length);
        return values;
      })
      .catch(console.error); // eslint-disable-line no-console
  }

  export() {
    const sheetName = 'Montatliche Kosten';
    const filename = `Monatliche-Kosten-${moment().format('YYYY-MM-DD')}.xlsx`;

    const table = angular.element('table')[0];
    const data = table.getElementsByTagName('tr');
    const headerRow = [...data[0].children].map(n => n.innerText);
    const rows = [...data].filter((el, idx) => idx > 1);

    const header = headerRow.reduce((acc, el, colNumber) => Object.assign({ [`${String.fromCharCode(65 + colNumber)}1`]: { v: el, t: 's', s: { font: { bold: true } } } }, acc), {});

    const ws = rows.reduce((acc, row, rowNumber) => {
      const fields = [...row.children];
      const obj = fields.reduce((o, el, colNumber) => {
        const letter = String.fromCharCode(65 + colNumber);
        let v = el.innerText;
        let t = 's';
        let z;

        if (v.endsWith('€')) {
          v = v.replace(/\./g, '');
          v = v.replace(',', '.');
          v = v.replace(' €', '');
          v = parseFloat(v);
          t = 'n';
          z = '#,##0.00';
        }

        return Object.assign({ [`${letter}${rowNumber + 2}`]: { v, t, z } }, o);
      }, {});
      return Object.assign({}, acc, obj);
    }, header);

    const keys = Object.keys(ws).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    ws['!ref'] = `${keys[0]}:${keys[keys.length - 1]}`;
    ws['!merges'] = [];

    /* add to workbook */
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    /* write workbook (use type 'array' for ArrayBuffer) */
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    /* generate a download */
    this.FileSaver.saveAs(new this.Blob([wbout], { type: 'application/octet-stream' }), filename, true);
  }
}

angular.module('berichtMonatlicheKosten')
  .component('berichtMonatlicheKosten', {
    template,
    controller: BerichtMonatlicheKostenCtrl,
  });
