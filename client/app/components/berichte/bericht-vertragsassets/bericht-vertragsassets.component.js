import moment from 'moment';
import * as angular from 'angular';
import * as XLSX from 'xlsx';

import template from './bericht-vertragsassets.template.html';

class BerichtVertragsassetsCtrl {
  constructor($filter, Bericht, NgTableParams, $location, FileSaver, Blob) {
    Object.assign(this, {
      $filter,
      Bericht,
      NgTableParams,
      $location,
      FileSaver,
      Blob,
    });
  }

  $onInit() {
    this.tableParams = new this.NgTableParams({
      group: 'Gegenstand',
    }, {
      groupOptions: { isExpanded: false },
      getData: params => this.getData(params),
    });
  }

  getData(params) {
    /*
    const paramsSorting = this.tableParams.sorting();
    const sorting = Object.keys(paramsSorting).map(key => `${key} ${paramsSorting[key].toUpperCase()}`); // eslint-disable-line max-len
    */

    return this.Bericht.vertragsgegenstaende(/*{filter: {order: sorting}}*/).$promise
      .then((values) => {
        params.total(values.length);
        return values;
      })
      .catch(console.error); // eslint-disable-line no-console
  }

  calcSum(data) { // eslint-disable-line class-methods-use-this
    return data.reduce((a, n) => a + n.Summe, 0);
  }

  export() {
    this.getData({ total: () => {} })
      .then((data) => {
        const sheetName = 'Vertragsassets';
        const filename = `Vertragsassets-${moment().format('YYYY-MM-DD')}.xlsx`;

        const headerRow = Object.keys(data[0]).filter(n => n !== 'idVertrag');
        const header = headerRow.reduce((acc, el, colNumber) => Object.assign({ [`${String.fromCharCode(65 + colNumber)}1`]: { v: el, t: 's', s: { font: { bold: true } } } }, acc), {});

        const ws = data.reduce((acc, row, rowNumber) => {
          const fields = headerRow;
          const obj = fields.reduce((o, el, colNumber) => {
            const letter = String.fromCharCode(65 + colNumber);
            const v = row[el];
            const t = typeof v === 'number' ? 'n' : 's';

            return Object.assign({ [`${letter}${rowNumber + 2}`]: { v, t } }, o);
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
      })
      .catch(console.error);
  }
}

angular.module('berichtVertragsassets')
  .component('berichtVertragsassets', {
    template,
    controller: BerichtVertragsassetsCtrl,
  });
