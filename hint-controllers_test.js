var hintLog = angular.hint;

var SEVERITY_ERROR = 1,
    SEVERITY_WARNING = 2;

describe('controllerDecorator', function() {
  var $controller, $rootScope;

  beforeEach(module('ngHintControllers'));

  beforeEach(inject(function(_$controller_, _$rootScope_, _$compile_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  function MockController() {
    var element = document.createElement('a');
    element.innerHTML = 'testValue';
  }

  it('should detect if a controller is instantiated on the window', function() {
    spyOn(hintLog, 'logMessage');
    var sampleControl = $controller(MockController);
    if (angular.version.minor < 3) {
      expect(hintLog.logMessage).toHaveBeenCalledWith('Controllers', 'It is against Angular best ' +
        'practices to instantiate a controller on the window. This behavior is deprecated in ' +
        'Angular 1.3.0', SEVERITY_WARNING);
    } else {
      expect(hintLog.logMessage).toHaveBeenCalledWith('Controllers', 'Global instantiation of ' +
        'controllers was deprecated in Angular 1.3.0. Define the controller on a module.', SEVERITY_ERROR);
    }
  });


  it('should not warn about angular internal controllers instantiated on the window', function() {
    spyOn(hintLog, 'logMessage');
    var scope = $rootScope.$new();
      angular.module('SampleApp', []).controller('SampleController', function($scope) {
        $scope.types = [
            { name: 'Controllers', isChecked: false},
            { name: 'Directives', isChecked: false},
            { name: 'DOM', isChecked: false},
            { name: 'Events', isChecked: false},
            { name: 'Interpolation', isChecked: false},
            { name: 'Modules', isChecked: false}
          ];
      });
      var ctrl = $controller('SampleController', {$scope: scope});
      var elm = angular.element('<div ng-controller="SampleController">' +
                                  '<span ng-repeat="type in types">' +
                                    '<input  type="checkbox" id="{{type.name}}" ng-click="changeList()" ng-model="type.isChecked">' +
                                      '{{type.name}}' +
                                  '</span>' +
                                  '<form></form>' +
                                '</div>');
      $compile(elm)(scope);
      $rootScope.$digest();
      expect(hintLog.logMessage).not.toHaveBeenCalled();
  });


  it('should allow the instantiation of global controller functions', function() {
    spyOn(hintLog, 'logMessage');
    var scope = $rootScope.$new();
      window.GlobalFunction = function GlobalFunction($scope) {
        $scope.types = [
            { name: 'Controllers', isChecked: false},
            { name: 'Directives', isChecked: false},
            { name: 'DOM', isChecked: false},
            { name: 'Events', isChecked: false},
            { name: 'Interpolation', isChecked: false},
            { name: 'Modules', isChecked: false}
          ];
      }
      var ctrl = $controller('GlobalFunction', {$scope: scope});
      var elm = angular.element('<div ng-controller="GlobalFunction">' +
                                  '<span ng-repeat="type in types">' +
                                    '<input  type="checkbox" id="{{type.name}}" ng-click="changeList()" ng-model="type.isChecked">' +
                                      '{{type.name}}' +
                                  '</span>' +
                                  '<form></form>' +
                                '</div>');
      expect(function() {
        $compile(elm)(scope);
        $rootScope.$digest();
      }).not.toThrow();
  });


  it('should still warn about the naming of global controller functions', function() {
    spyOn(hintLog, 'logMessage');
    var scope = $rootScope.$new();
    window.globalFunction = function globalFunction($scope) {
      $scope.types = [
          { name: 'Controllers', isChecked: false},
          { name: 'Directives', isChecked: false},
          { name: 'DOM', isChecked: false},
          { name: 'Events', isChecked: false},
          { name: 'Interpolation', isChecked: false},
          { name: 'Modules', isChecked: false}
        ];
    }
    var ctrl = $controller('globalFunction', {$scope: scope});
    var elm = angular.element('<div ng-controller="globalFunction">' +
                                '<span ng-repeat="type in types">' +
                                  '<input  type="checkbox" id="{{type.name}}" ng-click="changeList()" ng-model="type.isChecked">' +
                                    '{{type.name}}' +
                                '</span>' +
                                '<form></form>' +
                              '</div>');
    $compile(elm)(scope);
    $rootScope.$digest();
    expect(hintLog.logMessage).toHaveBeenCalledWith('Controllers', 'The best practice is to name ' +
      'controllers with an uppercase first letter. Check the name of \'globalFunction\'.', SEVERITY_WARNING);
    expect(hintLog.logMessage).toHaveBeenCalledWith('Controllers', 'The best practice is to name ' +
      'controllers ending with \'Controller\'. Check the name of \'globalFunction\'.', SEVERITY_WARNING);
  });


  it('should throw a helpful error if the controller cannot be created', function($scope) {
      var scope = $rootScope.$new();
      window.GlobalFunction = function GlobalFunction($scope) {
        $scope.types = [
            { name: 'Controllers', isChecked: false},
            { name: 'Directives', isChecked: false},
            { name: 'DOM', isChecked: false},
            { name: 'Events', isChecked: false},
            { name: 'Interpolation', isChecked: false},
            { name: 'Modules', isChecked: false}
          ];
      }
      expect(function() {
        var ctrl = $controller('NotTheGlobalFunction', {$scope: scope});
      }).toThrow('The controller function for NotTheGlobalFunction could not be found. ' +
          'Is the function registered under that name?');
  });


  it('should explain global controller deprecation for versions greater than 1.2.x', function() {
    if (angular.version.minor < 3) {
      return;
    }
    spyOn(hintLog, 'logMessage');
    var sampleControl = $controller(MockController);
    expect(hintLog.logMessage).toHaveBeenCalledWith('Controllers', 'Global instantiation of ' +
      'controllers was deprecated in Angular 1.3.0. Define the controller on a module.', SEVERITY_ERROR);
  });


  it('should not log a message if the controller is on the local scope', function() {
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('SampleController', function() {});
    var ctrl = $controller('SampleController');
    expect(hintLog.logMessage).not.toHaveBeenCalledWith('Controllers', 'It is against Angular' +
      'best practices to instantiate a controller on the window. This behavior is deprecated in' +
      ' Angular 1.3.0', (angular.version.minor < 3 ? SEVERITY_WARNING : SEVERITY_ERROR));
  });


  it('should warn if a controller name does not begin with an uppercase letter', function(){
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('sampleController', function() {});
    var ctrl = $controller('sampleController');
    expect(hintLog.logMessage).toHaveBeenCalledWith('Controllers', 'The best practice is to name ' +
      'controllers with an uppercase first letter. Check the name of \'sampleController\'.', SEVERITY_WARNING);
  });


  it('should not warn if a controller name begins with an uppercase letter', function(){
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('SampleController', function() {});
    var ctrl = $controller('SampleController');
    expect(hintLog.logMessage).not.toHaveBeenCalled();
  });


  it('should warn if a controller name does not include Controller', function(){
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('Sample', function() {});
    var ctrl = $controller('Sample');
    expect(hintLog.logMessage).toHaveBeenCalledWith('Controllers', 'The best practice is to name ' +
      'controllers ending with \'Controller\'. Check the name of \'Sample\'.', SEVERITY_WARNING);
  });


  it('should warn if a controller name does not end with Controller', function(){
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('SampleControllerYay', function() {});
    var ctrl = $controller('SampleControllerYay');
    expect(hintLog.logMessage).toHaveBeenCalledWith('Controllers', 'The best practice is to name ' +
      'controllers ending with \'Controller\'. Check the name of \'SampleControllerYay\'.', SEVERITY_WARNING);
  });


  it('should not warn if a controller ends with Controller', function(){
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('SampleController', function() {});
    var ctrl = $controller('SampleController');
    expect(hintLog.logMessage).not.toHaveBeenCalled();
  });


  it('should collect all hinting messages using hintLog', function() {
    var sampleControl = $controller(MockController);
    angular.module('SampleApp', []).controller('sample', function() {});
    var ctrl = $controller('sample');
    var log = hintLog.flush();
    expect(log['Controllers']['Warning Messages'].length).toBe(4);
  });
});
