(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('wizardReleaseInfoCtrl', wizardReleaseInfoCtrl);


    wizardReleaseInfoCtrl.$inject = ['$scope', 'dataList'];
    function wizardReleaseInfoCtrl($scope, dataList) {
        /* ***************************************************
                   VARIABLES
          **************************************************** */

        var vm = this;
        //set reference on vm to wizardCtrl data(wizardVm)
        vm.wizardVm = $scope.wizardVm;


        /*****************************************************
          *                  METHODS                          *
          *****************************************************/

        //TODO: check responsibility of list map by accountID
        vm.setReleaseTypesOptions = setReleaseTypesOptions;
        vm.setReleasesOptions = setReleasesOptions;
        vm.setAccountsExists = setAccountsExists;
        vm.setReleasesExists = setReleasesExists;
        vm.copyFromReleaseChanged = copyFromReleaseChanged;

        /*****************************************************
        *               METHODS - PRIVATE                   *
        *****************************************************/

        function copyFromReleaseChanged() {
            if (!vm.initAccountExists) {
                vm.initAccountExists = true;
                setAccountsExists();
            }
        }
        function setReleaseTypeOfleadSI() {
            var releaseType = _.filter(vm.data.releaseTypesOptions, { name: 'Lead SI' });
            vm.data.ReleaseTypeOfleadSI = releaseType.length > 0 ? releaseType[0].value : -1;
        }

        function setReleaseTypesOptions() {
            dataList.getReleaseTypes(true, vm.wizardVm.releaseData.accountID).then(function (releaseTypesOptions) {
                vm.data.releaseTypesOptions = releaseTypesOptions;
                setReleaseTypeOfleadSI();
            });
        }

        function setReleasesOptions() {
            dataList.getReleases(true, vm.wizardVm.releaseData.releaseTypeID).then(function (releasesOptions) {
                vm.data.releasesOptions = releasesOptions;
            });
        }

        function setAccountsExists() {
            dataList.getAcountsExists(true).then(function (accountsExistsOptions) {
                vm.data.accountsExistsOptions = accountsExistsOptions;
            });
        }

        function setReleasesExists() {
            dataList.getReleasesExists(true, vm.wizardVm.releaseData.accountID).then(function (releasesExistsOptions) {
                vm.data.releasesExistsOptions = releasesExistsOptions;
            });
        }

        /*
         * @description: keep global variable(vm.wizardVm.steps.releaseInfo.data) between the tabs, 
         * will be saved on wizardVm global variable
         * checks if data inited if not init data
         */
        function loadData() {
            if (!vm.wizardVm.steps.releaseInfo.data) {
                vm.data = vm.wizardVm.steps.releaseInfo.data = {};
                vm.data.releaseTypesOptions = [];
                vm.data.releasesOptions = [];
                vm.data.accountsExistsOptions = [];
                vm.data.releasesExistsOptions = [];

                dataList.getAcounts(true).then(function (accountsOptions) {
                    vm.data.accountsOptions = accountsOptions;
                });
            }
            else {
                vm.data = vm.wizardVm.steps.releaseInfo.data;
            }
        }

        function activate() {
            loadData();
        }
        /*****************************************************
        *                  EXECUTIONS                       *
        *****************************************************/

        activate();


    }



})();