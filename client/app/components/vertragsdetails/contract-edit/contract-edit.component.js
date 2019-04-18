import moment from 'moment';
import * as angular from 'angular';
import template from './contract-edit.template.html';

const has = (obj, key) => obj.hasOwnProperty.call(obj, key);

class ContractEditCtrl {
  constructor($routeParams, $uibModal, Kategorien, Vertrag, Sla, Kosten, Error, $location, User, $rootScope, Waehrung, Faelligkeit) { // eslint-disable-line max-len
    Object.assign(this, {
      $routeParams,
      $uibModal,
      Kategorien,
      Vertrag,
      Sla,
      Kosten,
      Error,
      $location,
      User,
      $rootScope,
      Waehrung,
      Faelligkeit,
      moment,
    }); // eslint-disable-line max-len

    this.saving = false;
    this.user = this.User.getCurrent();
    this.delSLA = [];
    this.delKosten = [];
    this.selectedItem = undefined;
  }

  $onInit() {
    this.waehrungOpts = this.Waehrung.find();
    this.faelligkeitOpts = this.Faelligkeit.find();

    if (has(this.$routeParams, 'kategorieid')) {
      this.kategorieid = this.$routeParams.kategorieid;
    }

    if (has(this.$routeParams, 'vertragid')) {
      this.vertrag = this.Vertrag.findOne({
        filter: {
          include: ['slas', 'vertragspartner', 'vertragsgegenstaende', 'dokumente', { kosten: ['waehrung', 'faelligkeit'] }],
          where: { id: this.$routeParams.vertragid },
        },
      }).$promise
        .then((vertrag) => {
          this.vertrag = vertrag;

          if (this.vertrag.anlagedatum) {
            this.vertrag.anlagedatum = new Date(vertrag.anlagedatum);
          } else {
            this.vertrag.anlagedatum = null;
          }

          if (this.vertrag.laufzeitbeginn) {
            this.vertrag.laufzeitbeginn = new Date(vertrag.laufzeitbeginn);
          } else {
            this.vertrag.laufzeitbeginn = null;
          }
          if (this.vertrag.laufzeitende) {
            this.vertrag.laufzeitende = new Date(vertrag.laufzeitende);
          } else {
            this.vertrag.laufzeitende = null;
          }

          if (this.vertrag.kuendigungsdatum) {
            this.vertrag.kuendigungsdatum = new Date(vertrag.kuendigungsdatum);
          } else {
            this.vertrag.kuendigungsdatum = null;
          }

          this.kategorieid = this.vertrag.idKategorie;
        });
    } else { // neuen Vertrag anlegen
      this.vertrag = {
        slas: [],
        idStatus: 1,
        laufzeitbeginn: null,
        kuendigungsdatum: null,
        vertragsgegenstaende: [],
        kosten: [],
      };

      if ('kategorieid' in this.$routeParams) {
        this.vertrag.idKategorie = parseInt(this.$routeParams.kategorieid, 10);
      }

      this.user.$promise
        .then((user) => {
          this.vertrag.idKoordinator = user.id;
        })
        .catch(console.error); // eslint-disable-line no-console
    }
  }

  save() {
    this.saving = true;

    if ('id' in this.vertrag) {
      // does not work as of https://github.com/strongloop/loopback-sdk-angular/issues/120#issuecomment-70683378
      // this.vertrag.$save();

      if (this.selectedItem) {
        this.vertrag.idparent = this.selectedItem.id;
      } else {
        this.vertrag.idparent = null;
      }
    } else {
      this.vertrag.angelegtvon = this.user.username;
      // switch this to db side: not null with default now()
      this.vertrag.anlagedatum = moment().toDate();
    }

    this.Vertrag.upsert(this.vertrag).$promise
      .then((vertrag) => {
        vertrag.slas = this.vertrag.slas; // eslint-disable-line no-param-reassign
        vertrag.kosten = this.vertrag.kosten; // eslint-disable-line no-param-reassign
        this.vertrag = vertrag;

        if ('slas' in this.vertrag && this.vertrag.slas.length > 0) {
          this.vertrag.slas.map((i) => {
            i.idVertrag = vertrag.id; // eslint-disable-line no-param-reassign
            return i;
          });

          return this.Sla.createOrUpdate(this.vertrag.slas).$promise;
        }

        return undefined;
      })
      .then(() => {
        // TODO: this is a duplicate from contract-edit-business-tab; change the way we save data!
        if (this.kosten && 'kosten' in this.kosten && this.kosten.kosten > 0 && this.kosten.kosten && this.kosten.datum) {
          this.kosten.idVertrag = this.vertrag.id;
          this.kosten.waehrung = this.waehrungOpts.find(n => n.id === this.kosten.idWaehrung); // eslint-disable-line max-len
          this.kosten.faelligkeit = this.faelligkeitOpts.find(n => n.id === this.kosten.idFaelligkeit); // eslint-disable-line max-len

          if (has(this.vertrag, 'kosten')) {
            this.vertrag.kosten.push(this.kosten);
          } else {
            this.vertrag.kosten = [this.kosten];
          }

          this.kosten = {};
        }
        if ('kosten' in this.vertrag && this.vertrag.kosten.length > 0) {
          this.vertrag.kosten = this.vertrag.kosten.map((item) => {
            item.idVertrag = this.vertrag.id; // eslint-disable-line no-param-reassign
            item.waehrung = this.waehrungOpts.find(n => n.id === item.idWaehrung); // eslint-disable-line no-param-reassign, max-len
            item.faelligkeit = this.faelligkeitOpts.find(n => n.id === item.idFaelligkeit); // eslint-disable-line no-param-reassign, max-len
            return item;
          });

          return this.Kosten.createOrUpdate(this.vertrag.kosten).$promise;
        }

        return undefined;
      })
      .then(() => {
        this.vertrag.kosten = this.Kosten.find({
          filter: {
            include: ['waehrung', 'faelligkeit'],
            where: {
              idVertrag: this.vertrag.id,
            },
          },
        });

        if (this.delKosten && this.delKosten.length > 0) {
          return this.Kosten.destroyMultipleById(this.delKosten).$promise;
        }

        return undefined;
      })
      .then(() => {
        if (this.delSLA && this.delSLA.length > 0) {
          return this.Sla.destroyMultipleById(this.delSLA).$promise;
        }

        return undefined;
      })
      .then(() => {
        this.saving = false;
        this.$rootScope.allowNavigation();
        this.$location.path(`/vertrag/${this.vertrag.id}/`);
      })
      .catch((fault) => {
        console.log('fault', fault); // eslint-disable-line no-console
        this.saving = false;

        if (has(fault, 'data') && has(fault.data, 'error') && has(fault.data.error, 'details') && has(fault.data.error.details, 'messages')) {
          let msgs = angular.copy(fault.data.error.details.messages);

          const fieldNameMap = {
            vertragsnr: 'Vertragsnummer',
            bezeichnung: 'Vertragsbezeichnung',
            status: 'Status',
            idVertragspartner: 'Vertragspartner',
            art: 'Vertragsart',
            idKategorie: 'Vertragsgruppe',
            kuendigungsoption: 'Kündigungsoption',
            idKoordinator: 'Koordinator',
            idparent: 'Übergeordneter Vertrag',
            rahmenvertragsnr: 'Rahmenvertragsnummer',
            ablageortoriginal: 'Ablageort Original',
            bemerkung: 'Bemerkung',
            laufzeitbeginn: 'Laufzeitbeginn',
            laufzeitende: 'Laufzeitende',
            mindestlaufzeit: 'Mindestlaufzeit',
            kuendigungsfrist: 'Kündigungsfrist',
            autoverlaengerung: 'Autom. Verlängerung',
            laufzeitverlaengerung: 'Laufzeit Verlängerung',
            vertragsstrafe: 'Vertragsstrafen',
            konto: 'Konto',
            kostenstelle: 'Kostenstelle',
            bestellnr: 'Bestellnummer',
            verantwortlicher: 'Verantwortlicher (KoSt)',
            organisationseinheit: 'Organisationseinheit',
          };

          const valueTranslationMap = {
            "can't be blank": 'darf nicht leer sein',
          };

          msgs = Object.keys(msgs).map(key => `${fieldNameMap[key]} ${valueTranslationMap[msgs[key][0]]}`);

          this.Error.message(`Es sind folgende Fehler aufgetreten: <ul><li>${msgs.join('</li><li>')}</li></ul>`);
        } else {
          this.Error.message('Es ist ein Fehler aufgetreten. Bitte prüfen Sie Ihre Eingaben.'); // was Error.message(httpResponse.error.message);
        }
      });
  }

  cancel() {
    this.$location.path(has(this.vertrag, 'id') ? `/vertrag/${this.vertrag.id}/` : '/vertragsliste/');
  }

  destroyContract() {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'vertragDestroy',
      resolve: {
        vertrag: () => this.vertrag,
      },
    });

    modalInstance.result.then((vertrag) => {
      this.Vertrag.deleteById({ id: vertrag.id }, () => {
        this.$location.path(`/vertragsliste/${this.vertrag.idKategorie}`);
      }, (err) => {
        console.error('ok.. this should not have happened!', err); // eslint-disable-line no-console
      });
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }
}

angular.module('contractEdit')
  .component('contractEdit', {
    template,
    controller: ContractEditCtrl,
  });
