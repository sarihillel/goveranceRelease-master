(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('wizardCtrl', wizardCtrl);

    wizardCtrl.$inject = ['$state', 'gicDataList', 'gicReleaseDataService', '$rootScope', '$scope', '$q', 'toaster', '$timeout'];

    function wizardCtrl($state, gicDataList, gicReleaseDataService, $rootScope, $scope, $q, toaster, $timeout) {
        /* ***************************************************
                   VARIABLES
          **************************************************** */
        /* jshint validthis:true */
        var vm = this;
        var sendListType = {
            stakeholder: 1,
            vendor_customer: 2
        }

        vm.edit = false;
        vm.isPublished = false;
        vm.gicReleaseData = {};

        //gic-wizard directive props
        vm.steps = {
            releaseInfo: {
                route: 'wizard.releaseInfo',
                params: $state.params,
                class: '_release_info_circle',
                title: 'Release<br>Information',
                data: {},
                validated: false,
                validate: function () {
                    return !!vm.gicReleaseData.u_account_dms &&
                        !!vm.gicReleaseData.u_release_type &&
                       (!!vm.gicReleaseData.u_release_dms || !!vm.gicReleaseData.u_release_name);
                }
            },
            stakholder: {
                route: 'wizard.stakholder',
                params: $state.params,
                class: '_stakeholder_circle',
                export: true,
                exportDisabled: true,
                title: 'Stakeholders<br>Definition',
                data: {},
                validated: false,
                validate: function () {
                    return _.every(vm.gicReleaseData.stakeholders, function (stakeholder) {
                        return !!stakeholder.user;
                    }) && _.every(vm.gicReleaseData.vendor_customers, function (vendor) {
                        return !!vendor.u_vendor_customer_type &&
                                (!!vendor.u_stakeholder_role || !!vendor.u_manual_role) &&
                            !!vendor.u_name &&
                            !!vendor.u_email;
                    });
                }
            },
            reports: {
                route: 'wizard.reports',
                params: $state.params,
                class: '_reports_circle',
                title: 'Proposed<br>Reports',
                data: {},
                validated: false,
                validate: function () {
                    return _.every(vm.gicReleaseData.proposed_reports, function (report) {
                        return !!report.u_frequency &&
                                !!report.u_description &&
                                !!report.u_project_phase &&
                                !!report.u_report_owner_temp &&
                                !!_.concat([], report.u_report_recipients_temp).length;
                    });
                }
            },
            meetings: {
                route: 'wizard.meetings',
                params: $state.params,
                class: '_date_circle',
                title: 'Proposed<br>Meetings',
                data: {},
                validated: false,
                validate: function () {
                    return _.every(vm.gicReleaseData.proposed_meetings, function (meeting) {
                        return !!meeting.u_meeting_name &&
                                !!meeting.u_agenda &&
                                !!meeting.u_frequency &&
                                !!meeting.u_project_phase &&
                                !!meeting.u_meeting_owner_temp &&
                                !!_.concat([], meeting.u_meeting_invitees_temp).length;
                    });
                }

            },
            preview: {
                route: 'wizard.preview',
                params: $state.params,
                class: '_preview_circle',
                title: 'Preview<br>& Submit',
                data: {},
                validated: false,
                validate: function () {
                    return true;
                }
            },
        };
        vm.topButtons = [
            {
                isShow: function () {
                    return !vm.isPublished;
                },
                class: 'saveIcon',
                click: _saveAsDraft,
            },
            {
                isShow: function (activeStep) {
                    return activeStep.export;
                },
                isDisabled: function (activeStep) {
                    return activeStep.exportDisabled;
                },
                class: 'exitIcon _pull_right',
                click: _saveAsDraft,
                title: function (activeStep) {
                    return activeStep.exportDisabled ? 'Please save before export' : 'Export to Excel'
                }
            }];
        vm.buttons = [
            {
                isShow: function (activeStep, indexActive) {
                    return indexActive == _.size(vm.steps) - 1 && vm.isPublished;
                },
                template: '<gic-modal options="::wizardVm.reSendModalOptions">RE-SEND EMAIL</gic-modal>',
            },
            {
                isShow: function (activeStep, indexActive) {
                    return indexActive == _.size(vm.steps) - 1 && !vm.isPublished;
                },
                click: _save,
                template: 'SAVE & SEND EMAIL',
            },
            {
                isShow: function (activeStep, indexActive) {
                    return indexActive == _.size(vm.steps) - 1 && !vm.isPublished;
                },
                click: function () {
                    var valid = validateAllSteps();
                    vm.stepsEvents.setStepValid(valid);
                    if (!valid) return;
                    _saveAsDraft();
                },
                template: 'SAVE AS A DRAFT',
            }
        ];
        vm.reSendModalOptions = {
            title: 'Re-Send Governance Mail',
            templateUrl: 'gic-select-re-send-template.html',
            okButton: 'SEND',
            modalScope: {
                //TODO: check it only stakeholders to send again
                stakeholders: [],
            },
            onRegisterApi: function (modalApi) {
                modalApi.on.open(function (data) {
                    data.modalScope.stakeholders = vm.gicReleaseData.stakeholders;
                });
                modalApi.on.ok(function (data) {
                    var listToSend = _.map(data.modalScope.stakeholdersToSend, 'sys_id');
                    _sendEmail(listToSend);
                });
            }
        };
        vm.stepsEvents = {};
        /*****************************************************
         *                  METHODS                          *
         *****************************************************/

        /*****************************************************
        *               METHODS - PRIVATE                   *
        *****************************************************/
        function _save() {
            var valid = validateAllSteps();
            vm.stepsEvents.setStepValid(valid);
            if (!valid) return;

            vm.gicReleaseData.u_release_status == gicReleaseDataService.enums.release_status.Published;
            _saveGovernanceRelease(vm.gicReleaseData).then(function (u_release_id) {
                //TODO: check if go or only set id?
                setGicReleaseData(u_release_id).then(function () {
                    var sendListStakeholder = _.map(vm.gicReleaseData.stakeholders, function (obj) {
                        return {
                            type: sendListType.stakeholder,
                            sys_id: sendListType.vendor_customer
                        }
                    });

                    var sendListVendorCustomer = _.map(vm.gicReleaseData.vendor_customers, function (obj) {
                        return {
                            type: sendListType.stakeholder,
                            sys_id: sendListType.vendor_customer
                        }
                    });

                    var list = _.concat(sendListStakeholder, sendListVendorCustomer);
                    _sendEmail(list);
                });

            }).then(function () {

            });
        }

        function _sendEmail(list) {
            gicDataList.sendEmail(list).then(function () {
                toaster.success('Send Mail', 'Mail was sent successfully');
            }, function () {
                toaster.error('Server error!', 'please contact help desk.');
            });
        }

        function _saveAsDraft(isAllSteps) {
            var valid = false
            if (isAllSteps) {
                var valid = validateAllSteps();
                vm.stepsEvents.setStepValid(valid);
                if (!valid) return;
                vm.gicReleaseData.u_release_status = gicReleaseDataService.enums.release_status.Draft;
                _saveGovernanceRelease(vm.gicReleaseData).then(function (u_release_id) {
                    //TODO: check if go or only set id?
                    setGicReleaseData(u_release_id);
                });
            }
            else {
                vm.stepsEvents.validateStep()
                    .then(function () {
                        vm.gicReleaseData.u_release_status = gicReleaseDataService.enums.release_status.Draft;
                        _saveGovernanceRelease(vm.gicReleaseData);
                    });
            }
        }

        function _saveGovernanceRelease(gicReleaseData) {
            var defer = $q.defer();
            toaster.pop({ type: 'wait', title: "Save release", body: "Saving Release" });

            gicDataList.saveGovernanceRelease(gicReleaseData).then(function (u_release_id) {
                toaster.clear();
                toaster.success('Save release', 'Release was saved successfully');
                $scope.$broadcast('wizardSave');
                defer.resolve(u_release_id);
            }, function () {
                toaster.clear();
                toaster.error('Server error!', 'please contact help desk.');
                defer.reject();
            });
            return defer.promise;
        }

        function validateAllSteps() {
            return _.every(_.values(vm.steps), function (step) {
                return step.validate();
            });
        }

        /*
         * @description: set vm.gicReleaseData 
         */
        function setGicReleaseData(u_release_id) {
            if (u_release_id != "0")
                return gicDataList.getGovernanceReleaseById(u_release_id)
                 .then(function (data) {
                     if (data) {
                         gicReleaseDataService.gicReleaseData = data;
                         gicReleaseDataService.mapStakholdersToTempId();
                         vm.gicReleaseData = data;
                         vm.edit = true;
                         vm.isPublished = vm.gicReleaseData.u_release_status == gicReleaseDataService.enums.release_status.Published;
                         if (vm.isPublished) {
                             vm.stepsEvents.setAllStepsValid();
                         }
                         $scope.$broadcast('wizardDataChanged', data);
                     }
                     else {
                         toaster.error('Server error!', 'please contact help desk.');
                         $state.go('wizard.releaseInfo', { u_release_id: 0 });
                     }
                 }, function error() {
                     toaster.error('Server error!', 'please contact help desk.');
                     $state.go('wizard.releaseInfo', { u_release_id: 0 });
                 });
            else {
                gicReleaseDataService.gicReleaseData = vm.gicReleaseData = {};
                vm.isPublished = false;
                vm.edit = false;
                $scope.$broadcast('wizardDataChanged', {});
                return $q.resolve();
            }
        }

        function activate() {
            vm.u_release_id = $state.params.u_release_id;
            setGicReleaseData(vm.u_release_id);
        }



        /*****************************************************
        *                  EXECUTIONS                       *
        *****************************************************/
        activate();


    }
})();
