(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('wizardReportsCtrl', wizardReportsCtrl);


    wizardReportsCtrl.$inject = ['$scope', 'gicDataList','gicReleaseDataService'];
    function wizardReportsCtrl($scope, gicDataList, gicReleaseDataService) {
        /* ***************************************************
                   VARIABLES
          **************************************************** */

        var vm = this;
        //set reference on vm to wizardCtrl data(wizardVm)
        vm.wizardVm = $scope.wizardVm;
        vm.gicReleaseData = gicReleaseDataService.gicReleaseData;
        vm.isRequiredOptions = gicReleaseDataService.enums.is_required;
        vm.listSearch = [];
        vm.stakeholdersOwnerSearch = [];
        vm.data = {
            frequenciesOptions: [],
            projectPhasesOptions: []
        };
        var currentStep = vm.wizardVm.steps.reports;

        /*****************************************************
          *                  METHODS                          *
          *****************************************************/

        vm.removeReport = _removeReport;
        vm.addModalOptions = {
            title: 'Add New Report',
            templateUrl: 'gic-select-stream-template.html',
            okButton: 'ADD',
            modalScope: {
                stream: "",
                streams: []
            },
            onRegisterApi: function (modalApi) {
                modalApi.on.open(function (data) {
                    data.modalScope.streams = vm.data.reportsStreamsOptions;
                });
                modalApi.on.ok(function (data) {
                    _addStream(data.modalScope.stream);
                });
            }
        };
        /*****************************************************
        *               METHODS - PRIVATE                   *
        *****************************************************/

        function _addStream(stream) {
            var currentStream = vm.data.streamList[stream.u_stream_name] = _.concat(vm.data.streamList[stream.u_stream_name] || []);
            var u_order = currentStream.length > 0 ? _.toNumber(currentStream[currentStream.length - 1].u_order) + 1 : 1;
            var reportAdd = {
                "u_stream_name": stream.u_stream_name,
                "u_stream_order": stream.u_stream_order,
                "u_report_stream": stream.sys_id,
                "u_order": 3,
                "u_proposed_report": null,
                "u_report_name": "",
                "u_is_required": vm.isRequiredOptions.Yes,
                "u_description": "",
                "u_frequency": "",
                "u_project_phase": "1",
                "u_report_owner_emp": {},
                "report_recipents_emp": [],
                "u_template": "",
                "u_comments": "",
            };
            vm.gicReleaseData.proposed_reports.push(reportAdd);
            currentStream.push(reportAdd);
        }

        function _removeReport(report) {
            _.pull(vm.gicReleaseData.proposed_reports, report);
            _.pull(vm.data.streamList[report.u_stream_name], report);
        }

 
        /*
        * @description: sets vm.data.reportsStreamsOptions
        *                  for reports streams  options
        * @event: fire on load page
        */
        function setReportsStreamsOptions() {
            //gicDataList.getReportsStreams(false).then(function (list) {
            //    vm.data.reportsStreamsOptions = list;
            //});
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

        function setStreamList() {
            vm.data.streamList = gicReleaseDataService.getReportsStreamList();
            vm.data.reportsStreamsOptions = gicReleaseDataService.getReportsStreamOptions(vm.data.streamList);
        }

        /*
         * @description: keep global variable(vm.wizardVm.steps.reports.data) between the tabs, 
         * will be saved on wizardVm global variable
         * checks if data inited if not init data
         */
        function loadData() {
            if (!currentStep.data.init) {
                currentStep.data = vm.data;
                vm.data.init = true;

                setStreamList();
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