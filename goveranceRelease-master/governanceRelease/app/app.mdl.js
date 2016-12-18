(function () {
    'use strict';

    var app = angular.module('gicApp', [
          // Angular modules 
          'ngAnimate',
          'ui.router',
          'ui.bootstrap',
          'ngSanitize',
          'angular.filter',
          'toaster'

          // Custom modules 

          // 3rd Party Modules

    ])

    app.config(['$compileProvider', '$httpProvider', function ($compileProvider, $httpProvider) {
        $compileProvider.debugInfoEnabled(true);
        $httpProvider.useApplyAsync(true);
    }])

    app.run(['$rootScope', function ($rootScope) {
        $rootScope.mainTitle = 'Governance In A Click';
        $rootScope.$watch('title', function () {
            $rootScope.titleBody = $rootScope.mainTitle + '-' + $rootScope.title;
        })
        //TODO: add user model directive
        $rootScope.userName = 'Brynn Evans';

        $rootScope.$on('$stateChangeError', function (e, toState, toParams, fromState, fromParams, resolve) {
            if (angular.isObject(resolve) && resolve.type === 'redirect') {
                $state.go(resolve.state.state, resolve.state.stateParams);
                return false;
            }
        });
    }]);


    angular.element(document).ready(function () {
        angular.bootstrap(document.documentElement, ['gicApp']);
    });
})();