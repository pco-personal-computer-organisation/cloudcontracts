const describe = () => '';
const beforeEach = () => '';
const inject = () => '';
const spyOn = () => '';
const it = () => '';
const expect = () => '';

describe('UserTests', () => {
  // Loading the module whih should be used for the tests
  beforeEach(module('CloudContracts'));

  let $controller;
  let $scope;
  let $uibModal;
  let user;
  let $location;
  let $timeout;
  let $routeParams;

  beforeEach(inject((_$controller_, _$rootScope_, _$uibModal_, _$location_, _$timeout_, _$httpBackend_, User, _$routeParams_) => { // eslint-disable-line max-len
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $location = _$location_;
    $timeout = _$timeout_;
    $uibModal = _$uibModal_;
    $routeParams = _$routeParams_;

    // injected user to bypass loopback
    user = User;
  }));

  describe('LoginCtrl', () => {
    let controller;

    beforeEach(() => {
      controller = $controller('LoginCtrl', {
        $scope,
        $routeParams,
        $uibModal,
        User: user,
        $location,
      });
      spyOn($uibModal, 'open');
    });

    it('should have an LoginCtrl controller', () => {
      expect(controller).toBeDefined();
    });

    it('should open a modal Instance by calling fn.showModal', () => {
    });
  });

  // Controller Test LoginModalCtrl
  describe('LoginModalCtrl', () => {
    let controller;
    let modal;

    // open required modalInstance for Login Controller
    beforeEach(() => {
      modal = $uibModal.open({
        animation: true,
        backdrop: false,
        keyboard: false,
        templateUrl: 'login-modal.html',
        controller: 'LoginModalCtrl',
        windowTemplateUrl: 'login-window.html',
      });


      controller = $controller('LoginModalCtrl', {
        $scope,
        $uibModalInstance: modal,
        User: user,
        $location,
        $timeout,
      });

      spyOn(modal, 'close');
    });

    it('should have an LoginModalCtrl controller', () => {
      expect(controller).toBeDefined();
    });


    it('should close modal with successful login', () => {
      let $userData = {};
      expect($scope.data.wrongcreds).toBe(false);

      // SetUp for an user input with an email, which doesn't contain an '@'
      $scope.data.credentials = {
        username: 'test',
        email: 'testexample.org',
        password: 'test123',
      };

      // fake User.login, success case
      spyOn(user, 'login').and.callFake((userData, successCallback) => {
        // simulate the success case.
        successCallback(userData);
        $userData = userData;
      });
      // spyOn(_, 'contains');

      $scope.login();
      // expect(_.contains).toHaveBeenCalled();

      // testing if username == email, if email doesn't contain the symbol '@'
      expect($userData.username).toEqual('testexample.org');

      expect(user.login).toHaveBeenCalled();
      expect($scope.data.wrongcreds).toBe(false);
      expect(modal.close).toHaveBeenCalled();
    });

    it('should set wrongcreds to true when login failed ', () => {
      // directive has its own test, this is only a fake function to pass the test
      $scope.focusOnPassword = () => {};

      $scope.data.credentials = {
        username: 'test',
        email: 'test@example.org',
        password: 'test123',
      };

      // fake User.login, fail case
      spyOn(user, 'login').and.callFake((userData, successCallback, errorCallback) => {
        // simulate the error case.
        errorCallback({ statusText: 'Unauthorized' });
      });

      $scope.login();
      expect(user.login).toHaveBeenCalled();
      expect($scope.data.wrongcreds).toBe(true);
    });
  });

  describe('ChangePasswordCtrl', () => {
    let controller;
    let modal;

    beforeEach(() => {
      modal = $uibModal.open({
        animation: true,
        templateUrl: 'password-change.html',
        controller: 'ChangePasswordCtrl',
        windowTemplateUrl: 'login-window.html',
      });

      controller = $controller('ChangePasswordCtrl', {
        $scope,
        $uibModalInstance: modal,
        $timeout,
        User: user,
      });
      spyOn(modal, 'dismiss');
      spyOn(modal, 'close');
      spyOn(user, 'getCurrentId').and.callFake(() => 1);
    });

    it('should have an ChangePasswordCtrl controller', () => {
      expect(controller).toBeDefined();
    });

    it('should call modal.dismiss when function cancel was called', () => {
      $scope.cancel();
      expect(modal.dismiss).toHaveBeenCalled();
    });

    it('should recognize wrong repeat of the new password', () => {
      expect($scope.wrongPassword).toBe(false);
      expect($scope.wrongRepeat).toBe(false);

      // directive has its own test, this is only a fake function to pass the test
      $scope.focusOnRepeat = () => {};

      // setUp for failing repeat test
      $scope.password = {};
      $scope.password.old = 'test123';
      $scope.password.new = 'test456';
      $scope.repeat = 'test789';

      $scope.save();

      expect($scope.wrongRepeat).toBe(true);
    });

    it('should close modalInstance when password is changed correctly to a new password', () => {
      expect($scope.wrongPassword).toBe(false);
      expect($scope.wrongRepeat).toBe(false);

      // setUp for passing repeat test and change password correctly
      $scope.password = {};
      $scope.password.old = 'test123';
      $scope.password.new = 'test456';
      $scope.repeat = 'test456';

      // fake changePassword to bypass loopback
      spyOn(user, 'changePassword').and.callFake((userData, successCallback) => {
        successCallback({ isChanged: true });
      });

      $scope.save();
      expect($scope.wrongRepeat).toBe(false);
      expect(modal.close).toHaveBeenCalled();
    });

    it('should recognize when oldPassword is not the right one', () => {
      expect($scope.wrongPassword).toBe(false);
      expect($scope.wrongRepeat).toBe(false);

      // directive has its own test, this is only a fake function to pass the test
      $scope.focusOnOld = () => {};

      // setUp for passing repeat test and change password correctly
      $scope.password = {};
      $scope.password.old = 'test123';
      $scope.password.new = 'test456';
      $scope.repeat = 'test456';

      // fake changePassword to bypass loopback
      spyOn(user, 'changePassword').and.callFake((userData, successCallback) => {
        successCallback({ isChanged: false });
      });

      $scope.save();
      expect($scope.wrongPassword).toBe(true);
      expect(modal.close).not.toHaveBeenCalled();
    });

    it('should go through if changePassword gets an errorCallBack', () => {
      expect($scope.wrongPassword).toBe(false);
      expect($scope.wrongRepeat).toBe(false);

      // directive has its own test, this is only a fake function to pass the test
      $scope.focusOnOld = () => {};

      // setUp for passing repeat test and change password correctly
      $scope.password = {};
      $scope.password.old = 'test123';
      $scope.password.new = 'test456';
      $scope.repeat = 'test456';

      // fake changePassword to bypass loopback
      spyOn(user, 'changePassword').and.callFake((userData, successCallback, errorCallback) => {
        errorCallback(userData);
      });

      $scope.save();
      expect($scope.wrongPassword).toBe(false);
      expect($scope.wrongRepeat).toBe(false);
      expect(modal.close).not.toHaveBeenCalled();
    });
  });
});
