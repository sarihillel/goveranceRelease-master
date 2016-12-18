(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('wizardPreviewCtrl', wizardPreviewCtrl);

    wizardPreviewCtrl.$inject = ['$scope', 'gicDataList', 'gicReleaseDataService', '$filter'];
    function wizardPreviewCtrl($scope, gicDataList, gicReleaseDataService, $filter) {
        /* ***************************************************
                   VARIABLES
          **************************************************** */

        var vm = this;
        //set reference on vm to wizardCtrl data(wizardVm)
        vm.wizardVm = $scope.wizardVm;
        vm.gicReleaseData = gicReleaseDataService.gicReleaseData;

        //init on page load
        vm.isPMO = false;
        vm.userStakeholders = [];
        vm.userMeetings = [];
        vm.userMeetingsParticipating = [];
        vm.userReports = [];
        vm.userReportsParticipating = [];

        //vm.vendor_customer_types = gicReleaseDataService.enums.vendor_customer_type;
        var currentStep = vm.wizardVm.steps.preview;


        /*****************************************************
        *                  METHODS                          *
        *****************************************************/


        /*****************************************************
        *               METHODS - PRIVATE                   *
        *****************************************************/


        /*
        * @description: keep global variable(vm.wizardVm.steps.preview.data) between the tabs, 
        * will be saved on wizardVm global variable
        * checks if data inited if not init data
        */
        function loadData() {
            if (!currentStep.data.init) {
                currentStep.data = vm.data;
                vm.data.init = true;
            }
            else {
                vm.data = currentStep.data;
            }
        }

        function activate() {
            //loadData();
            vm.userStakeholders = gicReleaseDataService.getUserStakeholders();
            vm.isPMO = gicReleaseDataService.isPMO();
            if (!vm.isPMO) {
                vm.userMeetings = gicReleaseDataService.getUserMeetings();
                vm.userMeetingsParticipating = gicReleaseDataService.getUserMeetingsParticipating();
                vm.userReports = gicReleaseDataService.getUserReports();
                vm.userReportsParticipating = gicReleaseDataService.getUserReportsParticipating()
            }
            else {
                vm.userMeetingsParticipating = gicReleaseDataService.getPMOMeetings();
                vm.userReportsParticipating = gicReleaseDataService.getPMOReports();
            }

            vm.getListNames = gicReleaseDataService.getUserNamesStakeholderVendorByTempId;

        }
        /*****************************************************
        *                  EXECUTIONS                       *
        *****************************************************/

        activate();


    }



})();