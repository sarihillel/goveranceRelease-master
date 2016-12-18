(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('wizardReleaseInfoCtrl', wizardReleaseInfoCtrl);

    wizardReleaseInfoCtrl.$inject = ['$scope', 'gicDataList', 'gicReleaseDataService', 'toaster', '$q'];

    function wizardReleaseInfoCtrl($scope, gicDataList, gicReleaseDataService, toaster, $q) {
        /* ***************************************************
                   VARIABLES
          **************************************************** */

        var vm = this;
        vm.gicReleaseData = gicReleaseDataService.gicReleaseData;
        vm.wizardVm = $scope.wizardVm;
        //set reference on vm to wizardCtrl data(wizardVm)
        vm.data = {
            accountsOptions: [],
            releasesOptions: [],
            releaseTypesOptions: [],
            releaseTypeOfleadSI: -1,
            governanceAccountsOptions: [],
            governanceReleasesOptions: [],
            initGovernanceAccounts: false,
            copyFrom: {
                id: "",
                u_account_dms: "",
                selected: undefined,
                checked: false
            }
        }
        vm.modalScope = { message: '' }
        vm.modalApi = {};
        vm.modalOptions = {
            title: "Are You Sure?",
            template: '<div ng-bind-html="modalScope.message"></div>',
            modalScope: vm.modalScope,
            isBackend: true,
            onRegisterApi: function (modalApi) {
                vm.modalApi = modalApi;
            }
        }

        var currentStep = vm.wizardVm.steps.releaseInfo;
        var oldRelease_type = {
            u_release_type: vm.gicReleaseData.u_release_type,
            u_type_name: vm.gicReleaseData.u_type_name,
        }
        var oldCopyFrom = _.clone(vm.data.copyFrom, true);
        /*****************************************************
         *                  METHODS                          *
         *****************************************************/

        //TODO: check responsibility of list map by u_account_dms
        vm.setGovernanceReleases = setGovernanceReleases;
        vm.copyFromCheckedChanged = copyFromCheckedChanged;
        /*****************************************************
        *               METHODS - PRIVATE                   *
        *****************************************************/

        /*
         * @description: sets vm.data.accountsOptions
         *              from account table
         * @event:  fire on load this step
         */
        function setAccountOptions() {
            gicDataList.getAcounts(true).then(function (list) {
                vm.data.accountsOptions = list;
            });
        }

        /*
        * @description: sets vm.data.releasesOptions
        *              from release table by account choosen (vm.gicReleaseData.u_account_dms)
        * @event: fire on vm.gicReleaseData.u_account_dms changed (or init)
        */
        function setReleasesOptions() {
            gicDataList.getReleases(true, vm.gicReleaseData.u_account_dms).then(function (list) {
                vm.data.releasesOptions = list;
            });
        }

        /*
         * @description: sets vm.data.releaseTypesOptions
         *              from account table
         * @event:  fire on load this step 
         */
        function setReleaseTypesOptions() {
            gicDataList.getReleaseTypes(true).then(function (list) {
                vm.data.releaseTypesOptions = list;

                //define index of lease si (release type)
                var releaseType = _.filter(vm.data.releaseTypesOptions, { name: 'Lead SI' });
                vm.data.releaseTypeOfleadSI = releaseType.length > 0 ? releaseType[0].value : -1;
            });
        }

        /*
         * @description: sets vm.data.governanceAccountsOptions 
         *                  for account in goverance release table
         * @event: fire on 'copy from release'
         */
        function setGovernanceAccounts() {
            gicDataList.getGovernanceAcounts(true, vm.gicReleaseData.u_release_type).then(function (governanceAccountsOptions) {
                vm.data.governanceAccountsOptions = governanceAccountsOptions;
            });
        }

        /*
         * @description: set vm.data.governanceReleasesOptions 
         *              releases in goverance release table that related to choosen account (vm.data.copyFrom.u_account_dms)
         * @event: fire on 'copy from release' 
         */
        function setGovernanceReleases() {
            gicDataList.getGovernanceReleases(false, vm.gicReleaseData.u_release_type, vm.data.copyFrom.u_account_dms).then(function (governanceReleasesOptions) {
                vm.data.governanceReleasesOptions = governanceReleasesOptions;
            });
        }

        /*
         * @description: load the data on the first time they clicked
         * @event: fire on "copy from release" checked or unchecked
         */
        function copyFromCheckedChanged() {
            if (!vm.data.initGovernanceAccounts) {
                vm.data.initGovernanceAccounts = true;
                setGovernanceAccounts();
            }
            if (!vm.data.copyFrom.checked) {
                delete vm.data.copyFrom.u_account_dms;
                delete vm.data.copyFrom.selected;
            }
        }

        /*
         * @description: clean u_release_name or u_release_dms by lead si type of u_release_type
         * @event: on change "vm.gicReleaseData.u_release_type" (on ui , and in loading page)
         */
        function releaseTypeChanged() {
            //if (vm.data.copyFrom.selected &&
            //       vm.data.copyFrom.selected.u_release_type != vm.gicReleaseData.u_release_type) {
            //    delete vm.data.copyFrom.selected;
            //}
            if (vm.data.releaseTypeOfleadSI != vm.gicReleaseData.u_release_type) {
                vm.gicReleaseData.u_release_name = null;
            }
            else
                vm.gicReleaseData.u_release_dms = null;

        }

        /*
         * @description: check if release type change and give alert if data will be removed
         * @evet: fire on validation (clicking next)
         * @returns: promise<bool> (true or false)
         */
        function isGovernanceReleaseExists() {
            var governanceReleaseKeys = {
                u_account_dms: vm.gicReleaseData.u_account_dms,
                u_release_dms: vm.gicReleaseData.u_release_dms,
                u_release_type: vm.gicReleaseData.u_release_type,
                u_release_name: vm.gicReleaseData.u_release_name,
            }
            return gicDataList.isGovernanceReleaseExists(vm.gicReleaseData.sys_id, governanceReleaseKeys);
        }

        /*
         * @description: check if release type change and give alert if data will be removed
         * @evet: fire on validation (clicking next)
         * @returns: promise<bool>
         */
        function isChangedReleaseType() {
            var defer = $q.defer();
            var releaseTypeChanged = oldRelease_type.u_release_type != vm.gicReleaseData.u_release_type;

            if (releaseTypeChanged) {
                vm.modalScope.message = 'Please note: <br/> You changed the release type from ' + oldRelease_type.u_type_name + ' to ' + vm.gicReleaseData.u_type_name + '. All the date that was populated in the wizard will be deleted.<br/> Are you sure you want to continue?';
                vm.modalApi.events.open();
                vm.modalApi.on.ok(function () {
                    defer.resolve(true);
                })
                vm.modalApi.on.close(function () {
                    vm.gicReleaseData.u_release_type = oldRelease_type.u_release_type;
                    defer.reject();
                });
            }
            else
                defer.resolve(false);

            return defer.promise;
        }

        /*
         * @description: check if copy from id change and give alert if data will be removed
         * @evet: fire on validation (clicking next)
         * @param:{initMode} : true/false,true= the form is add mode and not copied data yet
         * @returns: promise<bool>
         */
        function isCopyFromChanged(initMode) {
            var defer = $q.defer();
            var copyFromUnChecked = vm.data.copyFrom.id > 0 && !vm.data.copyFrom.selected;
            var copyFromChanged = vm.data.copyFrom.selected && vm.data.copyFrom.selected.sys_id != vm.data.copyFrom.id;

            if ((copyFromUnChecked || copyFromChanged) && !initMode) {
                var checked = copyFromUnChecked ? 'uncheck' : 'change';
                vm.modalScope.message = 'Please Note: <br/> If you ' + checked + ' copy of release all the data that was populated in the wizard will be deleted.<br> Are you sure you want to continue?';
                vm.modalApi.events.open();
                vm.modalApi.on.ok(function () {
                    defer.resolve(true);
                })
                vm.modalApi.on.close(function () {
                    vm.data.copyFrom = oldCopyFrom;
                    defer.reject();
                });
            }
            else
                if (copyFromChanged) {
                    defer.resolve(true);
                }
                else
                    defer.resolve(false);
            return defer.promise;
        }


        /*
         * @description: select data to the next steps, from copy from release id they choose
         * @evet: fire on (clicking next) and copy from release checked
         */
        function copyDataFromRelease() {
            return gicDataList.getGovernanceReleaseById(vm.data.copyFrom.selected.sys_id)
                                 .then(function (data) {
                                     vm.wizardVm.copied = true;
                                     vm.gicReleaseData.stakeholders = data.stakeholders;
                                     vm.gicReleaseData.vendor_customers = data.vendor_customers;
                                     vm.gicReleaseData.proposed_reports = data.proposed_reports;
                                     vm.gicReleaseData.proposed_meetings = data.proposed_meetings;
                                     gicReleaseDataService.mapStakholdersToTempId();
                                 });
        }

        /*
         * @description: select data to the next steps, from admin configuration by release type id they choose
         * @evet: fire on (clicking next) and copy from release unchecked and release type id changed or init
         */
        function copyDataFromConfig() {
            return gicDataList.getReleaseConfig(vm.gicReleaseData.u_release_type)
                                  .then(function (data) {
                                      vm.wizardVm.copied = true;
                                      vm.gicReleaseData.stakeholders = data.stakeholders;
                                      vm.gicReleaseData.vendor_customers = []; //data.vendor_customers;
                                      vm.gicReleaseData.proposed_reports = data.proposed_reports;
                                      vm.gicReleaseData.proposed_meetings = data.proposed_meetings;
                                      gicReleaseDataService.mapStakholdersToTempId(true);
                                  });
        }

        /*
         * @description: keep global variable(vm.wizardVm.steps.releaseInfo.data) between the tabs, 
         * will be saved on wizardVm global variable
         * checks if data inited if not init data
         */
        function loadData() {
            if (!currentStep.data.init) {
                currentStep.data = vm.data;
                vm.data.init = true;

                setAccountOptions();
                setReleaseTypesOptions();

                $scope.$on('wizardDataChanged', function () {
                    vm.gicReleaseData = gicReleaseDataService.gicReleaseData;

                    if (vm.wizardVm.isPublished) {
                        unWatchAccount();
                        unWizardGo();
                    }
                    oldRelease_type = {
                        u_release_type: vm.gicReleaseData.u_release_type,
                        u_type_name: vm.gicReleaseData.u_type_name
                    }
                });

            }
            else {
                vm.data = vm.wizardVm.steps.releaseInfo.data;
                oldCopyFrom = _.clone(vm.data.copyFrom, true);
            }
        }

        function activate() {
            loadData();
        }
        /*****************************************************
        *                  EXECUTIONS                       *
        *****************************************************/

        activate();

        /*
         * @description: on click Next on wizard, validate the page and copy data (if needed) to the next wizard 
         * @param: {data}: our return object to wizardNext function (broadcast)
         *         {data.valid}: if the current form valid
         *         {data.next}: if go next or prevent it, next is returns value by 'wizardGoValidate',so we must define it to go next
         */
        var unWizardGo = $scope.$on('wizardGoValidate', function (event, data) {
            var initMode = (!vm.wizardVm.copied && !vm.wizardVm.edit);
            var error = function () {
                data.valid = false;
                data.next = false;
            }
            var success = function () { data.next = true; }
            //sets name references of gicReleaseData
            vm.gicReleaseData.u_release_name = vm.data.releasesOptions[vm.gicReleaseData.u_release_dms];
            vm.gicReleaseData.u_account_name = vm.data.accountsOptions[vm.gicReleaseData.u_account_dms];
            vm.gicReleaseData.u_type_name = vm.data.accountsOptions[vm.gicReleaseData.u_release_type];

            isGovernanceReleaseExists()
                .then(function (isExists) {
                    if (isExists) {
                        toaster.warning("Release already exists");
                        data.next = false;
                        return;
                    }

                    isCopyFromChanged(initMode)
                        .then(function (CopyFromChanged) {
                            var copyFromUnchecked = CopyFromChanged && !vm.data.copyFrom.selected;
                            if (initMode || copyFromUnchecked) {
                                data.doNext = copyDataFromConfig().then(success, error);
                                vm.data.copyFrom.id = "";
                            }
                            else {
                                if (!CopyFromChanged) {
                                    isChangedReleaseType()
                                        .then(function (ReleaseTypeChanged) {
                                            if (ReleaseTypeChanged)
                                                data.doNext = copyDataFromConfig().then(success, error);
                                            else
                                                data.next = true;
                                        }, error)
                                }
                                else {
                                    //copyFromRelease
                                    vm.data.copyFrom.id = vm.data.copyFrom.selected.sys_id;
                                    data.doNext = copyDataFromRelease().then(success, error);
                                }
                            }
                        }, error);
                }, error);
        });


        //release table related to u_account_dms
        var unWatchAccount = $scope.$watch('vm.gicReleaseData.u_account_dms', function (newValue, oldValue) {
            if (newValue != oldValue || !vm.data.initAccount) {
                setReleasesOptions();
                vm.data.initAccount = true;
            }
        });
        //release table related to u_account_dms
        var unWatchAccount = $scope.$watch('vm.gicReleaseData.u_release_type', function (newValue, oldValue) {
            if (newValue != oldValue)
                releaseTypeChanged();
        });


    }

})();