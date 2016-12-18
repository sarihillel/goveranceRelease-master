(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('wizardstakholderDefCtrl', wizardstakholderDefCtrl);


    wizardstakholderDefCtrl.$inject = ['$scope', 'dataList'];
    function wizardstakholderDefCtrl($scope, dataList) {
        /* ***************************************************
                   VARIABLES
          **************************************************** */

        var vm = this;
        //set reference on vm to wizardCtrl data(wizardVm)
        vm.wizardVm = $scope.wizardVm;

        console.log('wizardstakholderDefCtrl!');
        /*****************************************************
          *                  METHODS                          *
          *****************************************************/

        //TODO: check responsibility of list map by accountID
        vm.addReleaseStreamLead = addReleaseStreamLead;

        /*****************************************************
        *               METHODS - PRIVATE                   *
        *****************************************************/

        function setReleaseProgramManagements(programManagements) {

            //TODO: check how to do validation- maby check add
            if (vm.wizardVm.releaseData.releaseTypeID != vm.wizardVm.steps.stakholderDef.data.releaseTypeIDProgramManagements) {
                vm.wizardVm.steps.stakholderDef.data.releaseTypeIDProgramManagements = vm.wizardVm.releaseData.releaseTypeID;

                var releaseProgramManagementsFull = _.filter(vm.wizardVm.releaseProgramManagements, function (rpm) {
                    return !!rpm.stakeholderID;
                });
                var listByRules = _.filter(programManagements, { releaseTypeID: vm.wizardVm.releaseData.releaseTypeID });

                vm.wizardVm.releaseData.releaseProgramManagements = _.unionWith(releaseProgramManagementsFull, listByRules, function (pm1, pm2) {
                    return !pm1.stakeholderID && pm1.programManagementID == pm2.programManagementID;
                });
            }
        }


        function setReleaseStreamLeads(streamLeads) {

            //TODO: check how to do validation- maby check add
            if (vm.wizardVm.releaseData.releaseTypeID != vm.wizardVm.steps.stakholderDef.data.releaseTypeIDStreamLeads) {
                vm.wizardVm.steps.stakholderDef.data.releaseTypeIDStreamLeads = vm.wizardVm.releaseData.releaseTypeID;

                var releaseStreamLeadsFull = _.filter(vm.wizardVm.releaseStreamLeads, function (rpm) {
                    return !!rpm.stakeholderID;
                });
                var listByRules = _.filter(streamLeads, { releaseTypeID: vm.wizardVm.releaseData.releaseTypeID });

                vm.wizardVm.releaseData.releaseStreamLeads = _.unionWith(releaseStreamLeadsFull, listByRules, function (pm1, pm2) {
                    return !pm1.stakeholderID && pm1.streamLeadID == pm2.streamLeadID;
                });
            }
        }



        function addReleaseStreamLead() {

        }


        /*
         * @description: keep global variable(vm.wizardVm.steps.stakholderDef.data) between the tabs, 
         * will be saved on wizardVm global variable
         * checks if data inited if not init data
         */
        function loadData() {
            if (!vm.wizardVm.steps.stakholderDef.data) {
                vm.data = vm.wizardVm.steps.stakholderDef.data = {};
                vm.data.programManagements = [];
                vm.data.streamLeads = [];

                dataList.getProgramManagements().then(function (list) {
                    vm.data.programManagements = list;
                    setReleaseProgramManagements(vm.data.programManagements);
                });

                dataList.getStreamLeads().then(function (list) {
                    vm.data.streamLeads = list;
                    setReleaseStreamLeads(vm.data.streamLeads);
                });
            }
            else {
                vm.data = vm.wizardVm.steps.stakholderDef.data;
                setReleaseProgramManagements(vm.data.programManagements);
                setReleaseStreamLeads(vm.data.streamLeads)
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