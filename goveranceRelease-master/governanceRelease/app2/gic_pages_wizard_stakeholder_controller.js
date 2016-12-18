(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('wizardStakholderCtrl', wizardStakholderCtrl);


    wizardStakholderCtrl.$inject = ['$scope', 'gicDataList','gicReleaseDataService', '$q'];
    function wizardStakholderCtrl($scope, gicDataList, gicReleaseDataService, $q) {
        /* ***************************************************
                   VARIABLES
          **************************************************** */

        var vm = this;
        //set reference on vm to wizardCtrl data(wizardVm)
        vm.wizardVm = $scope.wizardVm;
        vm.gicReleaseData = gicReleaseDataService.gicReleaseData;
        vm.listSearch = [];
        vm.data = {
            stakeHoldersOptions: []
        }
        var currentStep = vm.wizardVm.steps.stakholder;
        vm.vendor_customer_types = gicReleaseDataService.enums.vendor_customer_type;

        /*****************************************************
          *                  METHODS                          *
          *****************************************************/
        vm.getUsers = getUsers;
        vm.addStakeholder = _addStakeholder;
        vm.removeStakeholder = _removeStakeholder;
        vm.addVendorCustomer = _addVendorCustomer;
        vm.removeVendorCustomer = _removeVendorCustomer;
        vm.getModalOptions = _getModalOptions;
        /*****************************************************
       *               METHODS - PRIVATE                   *
       *****************************************************/
        function _getModalOptions(currentStream) {
            return {
                title: 'New Stakeholder',
                templateUrl: 'gic-select-stream-template.html',
                okButton: 'ADD',
                modalScope: {
                    getUsers: getUsers,
                    manual_role: "",
                },
                onRegisterApi: function (modalApi) {
                    modalApi.on.ok(function (data) {
                        _addStakeholder(currentStream, data.modalScope.manual_role, data.modalScope.user);
                    });
                }
            };
        }

        function _addStakeholder(stream, u_role_name, user) {
            var emptyStream = {
                "sys_id": "",
                "temp_id": gicReleaseDataService.getNextStakeholderTempId(),
                "u_stakeholder_stream": stream.u_stakeholder_stream,
                "u_stream_name": stream.u_stream_name,
                "u_stream_order": stream.u_stream_order,
                "u_stream_is_manual": stream.u_stream_is_manual,
                "u_role_name": u_role_name,
                "u_is_mandatory": false,
                "u_order": ++stream.last_order,
                "user": user
            }

            vm.gicReleaseData.stakeholders.push(emptyStream);
        }

        function _addVendorCustomer() {
            var emptyVendorCustomer = {
                "sys_id": "",
                "u_vendor_customer_type": "0",
                "temp_id": gicReleaseDataService.getNextVendorTempId(),
                "u_stakholder_role": "",
                "u_manual_role": "",
                "u_name": "",
                "u_email": ""
            }

            vm.gicReleaseData.vendor_customers.push(emptyVendorCustomer);
        }

        function _removeStakeholder(stakeholder) {
            _.pull(vm.gicReleaseData.stakeholders, stakeholder);
        }

        function _removeVendorCustomer(vendor) {
            _.pull(vm.gicReleaseData.vendor_customers, vendor);
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
         * @description: sets vm.data.stakeHoldersOptions
         *                  for stakeHolders roles options
         * @event: fire on load page
         */
        function setStakeHoldersOptions() {
            //gicDataList.getStakeholders(vm.gicReleaseData.u_release_type).then(function (list) {
            //    vm.data.stakeHoldersOptions = list;
            //});
            return gicDataList.toOptions(gicReleaseDataService.getStakeholdersNotManual(), 'sys_id', 'u_role_name');
        }

        /*
         * @description: keep global variable(vm.wizardVm.steps.stakholder.data) between the tabs, 
         * will be saved on wizardVm global variable
         * checks if data inited if not init data
         */
        function loadData() {
            if (!currentStep.data.init) {
                currentStep.data = vm.data;
                vm.data.init = true;

                setStakeHoldersOptions();

            }
            else {
                vm.data = currentStep.data;
            }


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