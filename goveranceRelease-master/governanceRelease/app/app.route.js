(function () {
    'use strict';

    angular.module('gicApp')
    .config(['$stateProvider', '$locationProvider', '$urlRouterProvider',
        function ($stateProvider, $locationProvider, $urlRouterProvider) {

            var DIR = '';
            $stateProvider
                .state('home', {
                    url: '/',
                    controller: 'homeCtrl',
                    controllerAs: 'vm',
                    templateUrl: DIR + 'pages.home.tpl.html',
                    onEnter: ['$rootScope', function ($rootScope) {
                        $rootScope.homePage = true;
                        $rootScope.title = 'Landing Page'
                    }],
                    onExit: ['$rootScope', function ($rootScope) {
                        $rootScope.homePage = false;
                    }],
                })
                .state('wizard', {
                    url: '/release/:releaseID',
                    controller: 'wizardCtrl',
                    controllerAs: 'wizardVm',
                    templateUrl: DIR + 'pages.wizard.tpl.html',
                    onEnter: ['$rootScope', '$stateParams', function ($rootScope, $stateParams) {
                        if ($stateParams.releaseID) {
                            $rootScope.title = ' Edit:'
                        }
                        else
                            $rootScope.title = ' Add:'
                        $rootScope.title += ' Release Information'
                    }],
                    //onExit: ['$rootScope', function ($rootScope, $state) {
                    //}],
                })
                 // nested states 
                // each of these sections will have their own view
                // url will be nested (/release/:releaseID/releaseInfo)
                .state('wizard.releaseInfo', {
                    url: '/releaseInfo',
                    templateUrl: DIR + 'pages.wizard.releaseInfo.tpl.html',
                    controller: 'wizardReleaseInfoCtrl',
                    controllerAs: 'vm',

                })
                // url will be  (/release/:releaseID/stakholderDef)
                 .state('wizard.stakholderDef', {
                     url: '/stakholderDef',
                     templateUrl: DIR + 'pages.wizard.stakholderDef.tpl.html',
                     controller: 'wizardstakholderDefCtrl',
                     controllerAs: 'vm',
                 });

            // use the HTML5 History API
            $locationProvider.html5Mode(true);

            $urlRouterProvider
                .otherwise('/');


        }]);
})();