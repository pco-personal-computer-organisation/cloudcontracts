const describe = () => '';
const beforeEach = () => '';
const inject = () => '';
const spyOn = () => '';
const it = () => '';
const expect = () => '';

describe('MainTest', () => {
  // Loading the module which should be used for the tests
  beforeEach(module('CloudContracts'));

  let $controller;
  let $scope;
  let $uibModal;
  let user;
  let vertrag;
  let $location;
  let $route;
  let $routeParams;
  let $http;
  let $rootScope;

  beforeEach(inject((_$controller_, _$rootScope_, _$uibModal_, _$location_, _$timeout_, _$httpBackend_, User, Vertrag, _$route_, _$routeParams_) => { // eslint-disable-line max-len
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $location = _$location_;
    $uibModal = _$uibModal_;
    $http = _$httpBackend_;
    $rootScope = _$rootScope_;
    $route = _$route_;
    $routeParams = _$routeParams_;

    // injected user and vertrag to bypass loopback
    user = User;
    vertrag = Vertrag;
  }));

  // testing directive inputFocusFunction
  describe('focusDirective', () => {
    let compile;

    beforeEach(inject((_$compile_) => {
      compile = _$compile_;
    }));

    it('should focus on new created element by calling input-focus-function', () => {
      const element = compile('<input type="text" input-focus-function="focusOnElement">')($rootScope);
      // $rootScope.$digest();
      element.appendTo(document.body);
      $rootScope.focusOnElement();

      expect(element.is(':focus')).toBe(true);
    });
  });

  // testing directive <nav> </nav>
  describe('navDirective', () => {
    beforeEach(inject(() => {
      $http.when('GET', 'navbar.html').respond(() => [200, ['success'], {}]);
    }));

    it('should', () => {
      $scope.$digest();

      $http.expectGET('navbar.html');
    });
  });

  // Controller Test  AboutCTRL
  describe('AboutCtrl', () => {
    let controller;
    let modal;

    beforeEach(() => {
      modal = $uibModal.open({
        animation: true,
        templateUrl: 'about.html',
        controller: 'AboutCtrl',
      });
      controller = $controller('AboutCtrl', { $scope, $uibModalInstance: modal });
      spyOn(modal, 'dismiss');
    });

    it('should have an AboutCtrl controller', () => {
      expect(controller).toBeDefined();
    });

    it('should call modal.dismiss when function cancel was called', () => {
      $scope.cancel();
      expect(modal.dismiss).toHaveBeenCalled();
    });
  });

  describe('MainCtrl', () => {
    let controller;

    beforeEach(() => {
      controller = $controller('MainCtrl', {
        $scope,
        $http,
        $route,
        $routeParams,
        $location,
        $uibModal,
        User: user,
        Vertrag: vertrag,
      });
      spyOn($uibModal, 'open');
    });

    it('should have MainCtrl', () => {
      expect(controller).toBeDefined();
    });

    it('should open AboutModal correctly by calling $scope.about', () => {
      $scope.about();
      expect($uibModal.open).toHaveBeenCalledWith({
        animation: true,
        templateUrl: 'about.html',
        controller: 'AboutCtrl',
      });
    });

    it('should update $scope.dashboardCount by calling Vertrag.dashboardCount()', () => {
      spyOn(vertrag, 'dashboardCount').and.callFake(() => 25);
      $scope.updateDashCount();
      expect(vertrag.dashboardCount).toHaveBeenCalled();
      expect($scope.dashboardCount).toEqual(25);
    });

    it('isActive function should return true if viewLocation === location.path', () => {
      const viewLocation = $location.path();
      const isActive = $scope.isActive(viewLocation);
      expect(isActive).toBe(true);
    });

    it('isActive function should return false if viewLocation !== location.path', () => {
      const viewLocation = {};
      const isActive = $scope.isActive(viewLocation);
      expect(isActive).toBe(false);
    });

    it('should change location by calling $scope.go (w/ and w/o params)', () => {
      const path = '/new';
      const params = { troet: 'test' };

      // setting path and search to check if $scope.go will change it
      $location.path('/old').search({ blubb: 0 });
      expect($location.path()).toBe('/old');
      expect($location.search()).toEqual({ blubb: 0 });

      spyOn($scope, 'updateDashCount');

      // calling without parameters should change nothing
      $scope.go();
      expect($location.url()).toEqual('/old?blubb=0');

      // calling function without 'params' / search should not be changed
      $scope.go(path);
      expect($scope.updateDashCount).toHaveBeenCalled();
      expect($location.path()).toBe(path);
      expect($location.search()).toEqual({ blubb: 0 });

      // calling function with 'params'
      $scope.go(path, params);
      expect($scope.updateDashCount).toHaveBeenCalled();
      expect($location.path()).toBe(path);
      expect($location.search()).toEqual(params);

      // calling without parameters should change nothing
      $scope.go();
      expect($location.url()).toEqual('/new?troet=test');
    });

    it('should change location and call User.logout by calling $scope.logout', () => {
      spyOn(user, 'logout').and.callThrough();

      // alling logout and changing path with scope.go (tested before)
      $scope.logout();
      expect(user.logout).toHaveBeenCalled();
      expect($location.path()).toEqual('/login/');
    });

    it('should open the correct modalInstance by calling $scope.changePassword', () => {
      $scope.changePassword();
      expect($uibModal.open).toHaveBeenCalledWith({
        animation: true,
        templateUrl: 'password-change.html',
        controller: 'ChangePasswordCtrl',
        windowTemplateUrl: 'login-window.html',
      });
    });

    it('should change location by calling $scope.search(s) to the right one', () => {
      const s = 'test';
      const t = 5;
      // should also work with numbers instead of strings
      $scope.search(t);
      expect($location.path()).toEqual('/vertragsliste/');
      expect($location.search()).toEqual({ search: t });
      expect($location.url()).toEqual(`/vertragsliste/?search=${t}`);

      $scope.search(s);

      expect($location.path()).toEqual('/vertragsliste/');
      expect($location.search()).toEqual({ search: s });
      expect($location.url()).toEqual(`/vertragsliste/?search=${s}`);
    });
  });
});
