(function () {
    'use strict';

    angular
        .module('gicApp')
        .directive('gicWizard', gicWizard);

    gicWizard.$inject = ['$q', '$state', '$rootScope'];

    function gicWizard($q, $state, $rootScope) {
        var directive = {
            restrict: 'E',
            transclude: true,
            templateUrl: 'gic_directives_gic-wizard.html',
            //link: linkFunc,
            bindToController: {
                steps: "=",
                transparent: '=',
                topButtons: '=',
                buttons: '=',
                apiEvents: '='
            },
            controller: ['$scope', controller],
            controllerAs: 'vm',
        };

        return directive;

        function controller($scope) {

            /* ***************************************************
                      VARIABLES
             **************************************************** */
            var vm = this;
            vm.stepValid = 0;
            vm.active = 0;
            vm.valid = true;
            vm.stepsArray = _.values(vm.steps);
            vm.activeStep = vm.steps[0];

            /****************************************************
                       METHODS
            **************************************************** */
            vm.isStepDisable = _isStepDisable;
            vm.go = _go;

            vm.apiEvents.validateStep = _validateStep;
            vm.apiEvents.setStepValid = _setStepValid;
            vm.apiEvents.setAllStepsValid = _setAllStepsValid;
            /*****************************************************
            *               METHODS - PRIVATE                   *
            *****************************************************/
            function _isStepDisable(indexStep) {
                return vm.stepValid < indexStep;
            }
            function _setAllStepsValid() {
                vm.stepValid = _.size(vm.stepsArray);
            }

            /*
            * @description: set vm.stepValid 
            * @param: {isValid} ,bool: if current step is valid or not
            * @event: fire on validateStep 
            */
            function _setStepValid(isValid) {
                if (isValid) {
                    if (vm.stepValid <= vm.active) {
                        vm.stepValid = vm.active + 1;
                    }
                }
                else {
                    vm.stepValid = vm.active;
                }
                vm.valid = isValid;
            }

            /*
           * @description: on click Next on wizard, validate the step to check if go next or not
           * @returns promise<>
           */
            function _validateStep() {
                var defer = $q.defer();
                $scope.form.$setSubmitted();
                //$scope.form.$valid = true;
                if (!$scope.form.$valid)
                    defer.reject();
                else
                    if (!$scope.$$listenerCount['wizardGoValidate']) {
                        _setStepValid($scope.form.$valid);
                        defer.resolve();
                    }
                    else {
                        /*
                        * @param: {data}:  return object that define by  $scope.$on('wizardNext') 
                        *         {data.valid}: if the current form valid
                        *         {data.next}: if go next or prevent it,
                        *                  next is returns value by 'wizardGoValidate',
                        *                  while data.next doesn't change this function will wait
                        */
                        var data = {
                            valid: vm.valid,
                            next: undefined,
                        };
                        //for validate
                        $scope.$broadcast('wizardGoValidate', data);

                        var unWatchDataNext = $scope.$watch(
                            function variable() { return data.next; },
                            function whenChange(newValue, oldValue) {
                                if (newValue == oldValue) return;

                                unWatchDataNext();
                                if (!data.next)
                                    defer.reject();
                                else {
                                    _setStepValid(data.valid);
                                    defer.resolve();
                                }
                            })
                    }
                return defer.promise;
            }

            function _go(indexStep, noValidate) {
                var step = vm.stepsArray[indexStep];
                var isGoNext = vm.active < indexStep;
                if (!noValidate && isGoNext) {
                    //at next validate step
                    _validateStep()
                        .then(function () {
                            if (!vm.isStepDisable(indexStep))
                                $state.go(step.route, step.params, step.options);
                        });
                }
                else
                    $state.go(step.route, step.params, step.options);
            };

            //function resetFormValidation() {
            //    $scope.form.$setPristine();
            //    $scope.form.$setUntouched();
            //}

            /*
            * @description: whether to highlight given route as part of the current state 
            * @param: {step} 1 step of steps
            * @event:fire on updateSteps (redirect url)
            */
            function is_active(step) {
                var isAncestorOfCurrentRoute = $state.includes(step.route, step.params, step.options);
                return isAncestorOfCurrentRoute;
            };

            /*
             * @description:sets which step is active (used for highlighting)
             * @event: fire on redirect or loading
             */
            function updateSteps() {
                // delete vm.active;
                angular.forEach(_.values(vm.steps), function (step, index) {
                    step.active = is_active(step);
                    if (step.active) {
                        vm.active = index;
                        vm.activeStep = step;
                    }
                });
            };

            function activate() {
                updateSteps();
            };

            /*****************************************************
             *                  METHODS                          *
             *****************************************************/

            function unbind() {
                unbindStateChangeSuccess();
                unbindStateChangeError();
                unbindStateChangeCancel();
                unbindStateNotFound();
                unbindStateChangeStart();
            }

            /*****************************************************
             *                  EXECUTIONS                       *
             *****************************************************/

            activate();

            var unbindStateChangeSuccess = $rootScope.$on('$stateChangeSuccess', function () { updateSteps(); resetFormValidation(); });
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
            $scope.$on('$destroy', function () {
                unbind();
            });
        }
    }


})();