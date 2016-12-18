(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('wizardMeetingsCtrl', wizardMeetingsCtrl);


    wizardMeetingsCtrl.$inject = ['$scope', 'gicDataList','gicReleaseDataService'];
    function wizardMeetingsCtrl($scope, gicDataList, gicReleaseDataService) {
        /* ***************************************************
                   VARIABLES
          **************************************************** */

        var vm = this;
        //set reference on vm to wizardCtrl data(wizardVm)
        vm.wizardVm = $scope.wizardVm;
        vm.gicReleaseData = gicReleaseDataService.gicReleaseData;
        vm.isRequiredOptions = gicReleaseDataService.enums.is_required;
        vm.data = {
            frequenciesOptions: [],
            projectPhasesOptions: []
        }
        var currentStep = vm.wizardVm.steps.meetings;
        /*****************************************************
        *                  METHODS                          *
        *****************************************************/
        vm.addMeeting = _addMeeting;
        vm.removeMeeting = _removeMeeting;
        vm.getUsers = getUsers;
        /*****************************************************
        *               METHODS - PRIVATE                   *
        *****************************************************/

        function _addMeeting() {
            var list = vm.gicReleaseData.proposed_meetings;
            var u_order = list.length > 0 ? _.toNumber(list[list.length - 1].u_order) + 1 : 1;
            var meetingAdd = {
                "u_order": 3,
                "u_meeting_name": "",
                "u_proposed_meeting": null,
                "u_is_required": vm.isRequiredOptions.Yes,
                "u_agenda": "",
                "u_frequency": "",
                "u_frequency": "",
                "u_project_phase": "1",
                "u_meeting_owner_emp": {},
                "meeting_invitees_emps": [],
                "u_comments": "",
            };
            list.push(meetingAdd);
        }

        function _removeMeeting(meeting) {
            _.pull(vm.gicReleaseData.proposed_meetings, meeting);
        }

        /*
        * @description: sets vm.listSearch
        *                  for users finding
        * @event: fire on search user autocomplete
        */
        function getUsers(term, scope) {
            gicDataList
                .getUsers(term)
                .then(function (list) {
                    scope.listSearch = list;
                }, function () {
                    scope.listSearch = [];
                });
        }


        /*
        * @description: sets vm.data.frequenciesOptions
        *                  for frequencies options
        * @event: fire on load page
        */
        function setFrequenciesOptions() {
            gicDataList.getFrequencies(true).then(function (list) {
                vm.data.frequenciesOptions = list;
            });
        }

        /*
        * @description: sets vm.data.projectPhasesOptions
        *                  for project phases options
        * @event: fire on load page
        */
        function setProjectPhasesOptions() {
            gicDataList.getProjectPhases(true).then(function (list) {
                vm.data.projectPhasesOptions = list;
            });
        }

        /*
         * @description: keep global variable(vm.wizardVm.steps.proposedMeetings.data) between the tabs, 
         * will be saved on wizardVm global variable
         * checks if data inited if not init data
         */
        function loadData() {
            if (!currentStep.data.init) {
                currentStep.data = vm.data;
                vm.data.init = true;

                //setStakeHoldersOptions();
                setFrequenciesOptions();
                setProjectPhasesOptions();

            }
            else {
                vm.data = currentStep.data;
            }
            vm.stakeholdersOwnerSearch = gicReleaseDataService.getStakeholdersOwnerSearch();
            vm.stakeholdersRecipientSearch = _.concat(vm.stakeholdersOwnerSearch, gicReleaseDataService.getStakeholdersVendorSearch());
        }

        function activate() {
            loadData();
        }
        /*****************************************************
        *                  EXECUTIONS                       *
        *****************************************************/

        activate();
        $scope.$on('wizardSave', function () {
            currentStep.exportDisabled = false;
        });

    }



})();