const describe = () => '';
const beforeEach = () => '';
const inject = () => '';
const spyOn = () => '';
const it = () => '';
const expect = () => '';

describe('VertragTests', () => {
  // Loading the module which should be used for the tests
  beforeEach(module('CloudContracts'));

  let $controller;
  let $scope;
  let $uibModal;
  let vertrag;
  let $uibModalInstance;
  let kategorien;
  let $vertragspartner;

  beforeEach(inject((_$q_, _$controller_, _$routeParams_, _$httpBackend_, _$rootScope_, _$uibModal_, _$location_, User, Vertrag, Kategorien, _$route_, Vertragspartner) => { // eslint-disable-line max-len
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $uibModal = _$uibModal_;

    $uibModalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'vertrag-destroy.html',
      controller: 'VertragDestroyCtrl',
      resolve: {
        vertrag: () => $scope.vertrag,
      },
    });

    vertrag = Vertrag;
    kategorien = Kategorien;
    $vertragspartner = Vertragspartner;
  }));

  describe('VertragDestroyCtrl', () => {
    let controller;

    beforeEach(() => {
      controller = $controller('VertragDestroyCtrl', { $scope, $uibModalInstance, vertrag });

      spyOn($uibModalInstance, 'close');
      spyOn($uibModalInstance, 'dismiss');
    });

    it('should have VertragDestroyCtrl', () => {
      expect(controller).toBeDefined();
    });

    it('should close modal by calling $scope.destroy or $scope.cancel', () => {
      $scope.vertrag = { id: 1 };

      // destroy should close the modalInstance with result given Vertrag
      $scope.destroy();
      expect($uibModalInstance.close).toHaveBeenCalledWith($scope.vertrag);

      $scope.cancel();
      expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });

  describe('VertragRenewCtrl', () => {
    let controller;
    let status;
    let vertragspartner;
    let idVertrag;

    beforeEach(inject((Status, Vertragspartner) => {
      status = Status;
      vertragspartner = Vertragspartner;
    }));

    beforeEach(() => {
      idVertrag = 1555;
      controller = $controller('VertragRenewCtrl', {
        $scope,
        $uibModalInstance,
        idVertrag,
        Vertrag: vertrag,
        Status: status,
        Vertragspartner: vertragspartner,
      });
    });

    it('should have VertragRenewCtrl', () => {
      expect(controller).toBeDefined();
    });

    it('should dismiss modalInstance by calling $scope.cancel', () => {
      spyOn($uibModalInstance, 'dismiss');
      $scope.cancel();
      expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });

  describe('KategorieDestroyCtrl', () => {
    let controller;

    beforeEach(() => {
      controller = $controller('KategorieDestroyCtrl', {
        $scope,
        $uibModalInstance,
        Kategorien: kategorien,
        id: 5,
      });

      spyOn($uibModalInstance, 'close');
      spyOn($uibModalInstance, 'dismiss');
    });

    it('should have KategorieDestroyCtrl', () => {
      expect(controller).toBeDefined();
    });

    it('should close modal by calling $scope.destroy or $scope.cancel', () => {
      $scope.destroy();
      expect($uibModalInstance.close).toHaveBeenCalled();

      $scope.cancel();
      expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });

  describe('PartnerDestroyCtrl', () => {
    let controller;

    beforeEach(() => {
      controller = $controller('PartnerDestroyCtrl', {
        $scope,
        $uibModalInstance,
        Vertragspartner: $vertragspartner,
        vertragspartner: 5,
      });

      spyOn($uibModalInstance, 'close');
      spyOn($uibModalInstance, 'dismiss');
    });

    it('should have PartnerDestroyCtrl', () => {
      expect(controller).toBeDefined();
    });

    it('should close modal by calling $scope.destroy or $scope.cancel', () => {
      $scope.destroy();
      expect($uibModalInstance.close).toHaveBeenCalledWith($scope.vertragspartner);

      $scope.cancel();
      expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });

  describe('SlaDestroyCtrl', () => {
    let controller;

    beforeEach(() => {
      controller = $controller('SlaDestroyCtrl', {
        $scope,
        $uibModalInstance,
        sla: {
          id: 0,
          idVertrag: 0,
          name: '',
          wert: '',
        },
      });

      spyOn($uibModalInstance, 'close');
      spyOn($uibModalInstance, 'dismiss');
    });

    it('should have SlaDestroyCtrl', () => {
      expect(controller).toBeDefined();
    });

    it('should close modal by calling $scope.destroy or $scope.cancel', () => {
      $scope.destroy();
      expect($uibModalInstance.close).toHaveBeenCalledWith($scope.sla);

      $scope.cancel();
      expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });

  describe('GegenstandDestroyCtrl', () => {
    let controller;

    beforeEach(() => {
      controller = $controller('GegenstandDestroyCtrl', {
        $scope,
        $uibModalInstance,
        gegenstand: {},
      });

      spyOn($uibModalInstance, 'close');
      spyOn($uibModalInstance, 'dismiss');
    });

    it('should have GegenstandDestroyCtrl', () => {
      expect(controller).toBeDefined();
    });

    it('should close modal by calling $scope.destroy or $scope.cancel', () => {
      $scope.destroy();
      expect($uibModalInstance.close).toHaveBeenCalledWith($scope.gegenstand);

      $scope.cancel();
      expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });

  describe('DocumentRemoveCtrl', () => {
    let controller;

    beforeEach(() => {
      controller = $controller('DocumentRemoveCtrl', { $scope, $uibModalInstance, dokument: {} });

      spyOn($uibModalInstance, 'close');
      spyOn($uibModalInstance, 'dismiss');
    });

    it('should have DocumentRemoveCtrl', () => {
      expect(controller).toBeDefined();
    });

    it('should close modal by calling $scope.destroy or $scope.cancel', () => {
      $scope.destroy();
      expect($uibModalInstance.close).toHaveBeenCalledWith($scope.dokument);

      $scope.cancel();
      expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });
});
