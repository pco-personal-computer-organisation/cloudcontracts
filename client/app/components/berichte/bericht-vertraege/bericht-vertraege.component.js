import moment from 'moment';
import * as angular from 'angular';
import * as XLSX from 'xlsx';

import template from './bericht-vertraege.template.html';

/* eslint-disable no-param-reassign */

class BerichtVertraegeCtrl {
  constructor($filter, ImportExport, NgTableParams, FileSaver, Blob) { // eslint-disable-line max-len
    Object.assign(this, {
      $filter,
      ImportExport,
      NgTableParams,
      FileSaver,
      Blob,
    }); // eslint-disable-line max-len
  }

  $onInit() {
    this.tableParams = new this.NgTableParams({
      count: 32000,
    }, {
      counts: [],
      getData: params => this.getData(params),
    });
  }

  getData(params) {
    this.showSpinner = true;

    const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    return this.ImportExport.vertraege().$promise
      .then((values) => { // eslint-disable-line max-len
        const data = values.map((obj) => {
          Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === 'string' && dateFormat.test(obj[key])) {
              obj[key] = moment(obj[key]).format('DD.MM.YYYY'); // eslint-disable-line no-param-reassign
            }
          });
          return obj;
        });

        this.cols = data
          .reduce((acc, el) => {
            const keys = Object.keys(el);
            keys.forEach(k => (acc.includes(k) ? undefined : acc.push(k)));
            return acc;
          }, [])
          .map(col => ({
            field: col,
            title: col,
            sortable: false,
            show: true,
          }));

        this.showSpinner = false;

        params.total(data.length);
        return data;
      })
      .catch(console.error); // eslint-disable-line no-console
  }

  export() {
    const sheetName = 'Vertragsstammdaten';
    const filename = `Vertragsstammdaten-${moment().format('YYYY-MM-DD')}.xlsx`;

    const ws = XLSX.utils.json_to_sheet(this.tableParams.data.map((n) => {
      delete n.$$hashKey; // eslint-disable-line no-param-reassign
      return n;
    }));

    /* add to workbook */
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    /* write workbook (use type 'array' for ArrayBuffer) */
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    /* generate a download */
    this.FileSaver.saveAs(new this.Blob([wbout], { type: 'application/octet-stream' }), filename, true);
  }
}

angular.module('berichtVertraege')
  .component('berichtVertraege', {
    template,
    controller: BerichtVertraegeCtrl,
  });
