(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('wizardCtrl', wizardCtrl);

    wizardCtrl.$inject = ['$state', 'dataList', '$rootScope', '$scope'];

    function wizardCtrl($state, dataList, $rootScope, $scope) {
        /* jshint validthis:true */
        var vm = this;
        vm.edit = false;
        vm.releaseData = {};

        vm.steps = {
            releaseInfo: {
                route: 'wizard.releaseInfo',
                params: $state.params,
                class: '_release_info_circle',
                title: 'Release<br>Information'
            },
            stakholderDef: {
                route: 'wizard.stakholderDef',
                params: $state.params,
                class: '_stakeholder_circle',
                title: 'Stakeholders<br>Definition',
                export: true
            },
            proposedReports: {
                route: 'wizard.proposedReports',
                params: $state.params,
                class: '_reports_circle',
                title: 'Proposed<br>Reports'
            },
            proposedMeetings: {
                route: 'wizard.proposedMeetings',
                params: $state.params,
                class: '_date_circle',
                title: 'Proposed<br>Meetings'
            },
            preview: {
                route: 'wizard.preview',
                params: $state.params,
                class: '_preview_circle',
                title: 'Proposed<br>Meetings'
            },
        };

        vm.stepValid = 1;

        vm.stepsArray = _.values(vm.steps);

        vm.isStepDisable = function (indexStep) {
            return vm.stepValid < indexStep;
        }

        vm.go = function (indexStep) {
            var step = vm.stepsArray[indexStep];
            if (!vm.isStepDisable(indexStep))
                $state.go(step.route, step.params, step.options);
        };

        vm.setReleaseData = function (releaseID) {
            dataList.getReleaseData(releaseID).then(function (releaseData) {
                vm.releaseData = releaseData;
                $scope.$broadcast('wizardReleaseDataChanged', releaseData)
            });
        }

        //vm.releaseData = {
        //    accountID: "1",
        //    releaseTypeID: "1",
        //    releaseID: "",
        //    leadSIReleaseName: 'lead SI Release Name',
        //};

        /* whether to highlight given route as part of the current state */
        vm.is_active = function (step) {
            var isAncestorOfCurrentRoute = $state.includes(step.route, step.params, step.options);
            return isAncestorOfCurrentRoute;
        };

        function updateSteps() {
            // sets which step is active (used for highlighting)
            // delete vm.active;
            angular.forEach(_.values(vm.steps), function (step, index) {
                step.active = vm.is_active(step);
                if (step.active) {
                    vm.active = index;
                    vm.activeStep = step;
                }
            });

        };


        var unbindStateChangeSuccess = $rootScope.$on('$stateChangeSuccess', function () { updateSteps(); });
        var unbindStateChangeError = $rootScope.$on('$stateChangeError', function () { updateSteps(); });
        var unbindStateChangeCancel = $rootScope.$on('$stateChangeCancel', function () { updateSteps(); });
        var unbindStateNotFound = $rootScope.$on('$stateNotFound', function () { updateSteps(); });
        var unbindStateChangeStart = $rootScope.$on('$stateChangeStart', function (evt, to, params) {
            var stepSearch = { route: to.name, params: params };
            var indexStep = _.findIndex(vm.stepsArray, stepSearch);
            if (vm.isStepDisable(indexStep)) {
                evt.preventDefault();
                console.log("this step " + to.name + " disabled ");
            }
        });

        function unbind() {
            unbindStateChangeSuccess();
            unbindStateChangeError();
            unbindStateChangeCancel();
            unbindStateNotFound();
            unbindStateChangeStart();
        }

        activate();

        function activate() {
            updateSteps();
            if (vm.isStepDisable(vm.active)) {
                vm.go(0);
            }

            //if releaseID is edit
            if (!!$state.params.releaseID) {
                vm.edit = true;
                vm.releaseID = $state.params.releaseID;
                vm.setReleaseData(vm.releaseID);
            }

        }

        $scope.$on('$destroy', function () {
            unbind();
        });
    }
})();
