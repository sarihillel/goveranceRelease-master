(function () {
    'use strict';

    angular.module('gicApp')
    .config(['$stateProvider', '$locationProvider', '$urlRouterProvider',
        function ($stateProvider, $locationProvider, $urlRouterProvider) {
            angular.element(document.body).addClass('_cover');
            var isInitWizard = false;
            var DIR = '';
            $stateProvider
                .state('home', {
                    url: '/',
                    controller: 'homeCtrl',
                    controllerAs: 'vm',
                    templateUrl: DIR + 'gic_pages_home_template.html',
                    onEnter: ['$rootScope', function ($rootScope) {
                        angular.element(document.body).addClass('_cover2');
                        angular.element(document.body).removeClass('_cover');
                        $rootScope.title = 'Landing Page';
                        $rootScope.homePage = true;
                    }],
                    onExit: ['$rootScope', function ($rootScope) {
                        angular.element(document.body).addClass('_cover');
                        angular.element(document.body).removeClass('_cover2');
                        $rootScope.homePage = false;
                    }],
                })
                .state('wizard', {
                    url: '/release/:u_release_id',
                    controller: 'wizardCtrl',
                    controllerAs: 'wizardVm',
                    templateUrl: DIR + 'gic_pages_wizard_base_template.html',
                    onEnter: ['$rootScope', '$stateParams', '$state', function ($rootScope, $stateParams) {
                        if ($stateParams.u_release_id) {
                            $rootScope.title = ' Edit:'
                        }
                        else
                            $rootScope.title = ' Add:'
                    }],
                    //at first time go to first page
                    resolve: {
                        isValid: function ($state, $q, $stateParams) {
                            if (!isInitWizard) {
                                isInitWizard = true
                                return $q.reject({
                                    type: 'redirect',
                                    state:{
                                        state: 'wizard.releaseInfo',
                                        stateParams: $stateParams,
                                    }
                                    
                                });
                            }
                            return isInitWizard;
                        }
                    }
                })
                 // nested states 
                // each of these sections will have their own view
                .state('wizard.releaseInfo', {
                    url: '/releaseInfo',// url will be (/release/:u_release_id/releaseInfo)
                    templateUrl: DIR + 'gic_pages_wizard_releaseInfo_template.html',
                    controller: 'wizardReleaseInfoCtrl',
                    controllerAs: 'vm',

                })
                .state('wizard.stakholder', {
                    url: '/stakholder',// url will be  (/release/:u_release_id/stakholder)
                    templateUrl: DIR + 'gic_pages_wizard_stakholder_template.html',
                    controller: 'wizardStakholderCtrl',
                    controllerAs: 'vm',
                })
                .state('wizard.reports', {
                    url: '/reports',// url will be  (/release/:u_release_id/Reports)
                    templateUrl: DIR + 'gic_pages_wizard_reports_template.html',
                    controller: 'wizardReportsCtrl',
                    controllerAs: 'vm',
                })
                .state('wizard.meetings', {
                    url: '/meetings',// url will be  (/release/:u_release_id/Meetings)
                    templateUrl: DIR + 'gic_pages_wizard_meetings_template.html',
                    controller: 'wizardMeetingsCtrl',
                    controllerAs: 'vm',
                })
                .state('wizard.preview', {
                    url: '/preview',// url will be  (/release/:u_release_id/preview)
                    templateUrl: DIR + 'gic_pages_wizard_preview_template.html',
                    controller: 'wizardPreviewCtrl',
                    controllerAs: 'vm',
                    onEnter: ['$rootScope', function ($rootScope) {
                        $rootScope.title = 'privew Page';
                        $rootScope.previewPage = true;
                    }],
                    onExit: ['$rootScope', function ($rootScope) {
                        $rootScope.previewPage = false;
                    }],
                });


            $urlRouterProvider
                .otherwise('/');

            // use the HTML5 History API
            // $locationProvider.html5Mode(true);

        }]);
})();