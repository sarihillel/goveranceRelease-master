(function () {
    'use strict';
    var app = angular.module('gicApp', [
          // Angular modules 
          'ngAnimate',
          'ui.router',
          'ui.bootstrap',
          'ngSanitize',
          'angular.filter',

         // Custom modules 

         // 3rd Party Modules
        'toaster',
        'ui.select'
    ])

    app.config(['$compileProvider', '$httpProvider', function ($compileProvider, $httpProvider) {
        $compileProvider.debugInfoEnabled(true);
        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push(errorInterceptor);

        if (!window.g_user) {
            window.g_user = {
                fullName: "rivki aizen",
                userID: "1"
            }
        }
    }])

    app.run(['$rootScope', '$state', function ($rootScope, $state) {
        $rootScope.mainTitle = 'Governance In A Click';

        //define service now objects
        //if on servicenow or in local
        $rootScope.userName = window.g_user.fullName;

        //if title changed in other page sets titleBody value
        $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams, resolve) {
            document.title = $rootScope.mainTitle + '-' + $rootScope.title;
        });

        $rootScope.$on('$stateChangeError', function (e, toState, toParams, fromState, fromParams, resolve) {
            if (angular.isObject(resolve) && resolve.type === 'redirect') {
                $state.go(resolve.state.state, resolve.state.stateParams);
                return false;
            }
        });
       
        //$rootScope.$on(HTTP_ERRORS.FORBIDDEN, function (e, error) {
        //});

        //$rootScope.$on(HTTP_ERRORS.BAD_REQUEST, function (e, error) {
        //});

        $rootScope.$on(HTTP_ERRORS.INTERNAL, function (e, error) {
            toaster.error('Server error!', 'please contact help desk.')
        });

    }]);


    angular.element(document).ready(function () {
        angular.bootstrap(document.getElementById('gicApp'), ['gicApp']);
    });


    //TODO:seperate it to differant pages
    errorInterceptor.$inject = ['$q', '$rootScope', 'HTTP_ERRORS'];
    function errorInterceptor($q, $rootScope, HTTP_ERRORS) {
        return {
            responseError: function (error) {
                if (error.config && error.config.suppressErrors) {
                    return $q.reject(error);
                }

                var ERRORS = {
                    UNAUTHORIZED: 401,
                    FORBIDDEN: 403,
                    BAD_REQUEST: 400,
                    INTERNAL: 404
                };

                switch (error.status) {
                    case ERRORS.UNAUTHORIZED: {
                        $rootScope.$broadcast(HTTP_ERRORS.UNAUTHORIZED, error);

                        return $q.reject(error);
                    }
                    case ERRORS.FORBIDDEN: {
                        $rootScope.$broadcast(HTTP_ERRORS.FORBIDDEN, error);

                        return $q.reject(error);
                    }
                    case ERRORS.BAD_REQUEST: {
                        $rootScope.$broadcast(HTTP_ERRORS.BAD_REQUEST, error);

                        return $q.reject(error);
                    }
                    case ERRORS.INTERNAL: {
                        $rootScope.$broadcast(HTTP_ERRORS.INTERNAL, error);

                        return $q.reject(error);
                    }
                }

                if (String(error.status)[0] === '5') {
                    $rootScope.$broadcast(HTTP_ERRORS.INTERNAL, error);
                }

                return $q.reject(error);
            }
        };
    };
    var HTTP_ERRORS = {
        UNAUTHORIZED: 'httpError.Unauthorized',
        FORBIDDEN: 'httpError.Forbidden',
        BAD_REQUEST: 'httpError.BadRequest',
        INTERNAL: 'httpError.Internal'
    }

    app.constant('HTTP_ERRORS', HTTP_ERRORS);



})();