(function () {
    'use strict';

    angular
        .module('gicApp')
        .directive('gicModal', gicModal);

    gicModal.$inject = ['$uibModal', '$log', '$filter'];

    function gicModal($uibModal, $log, $filter) {
        var idModal = 0;

        var directive = {
            restrict: 'E',
            transclude: true,
            scope: {
                options: "<",
            },
            templateUrl: 'gic_directives_gic-modal.html',
            link: linkFunc
        };

        return directive;

        function linkFunc(scope, elem, attrs) {

            /* ***************************************************
                      VARIABLES
             **************************************************** */
            //unique modal name
            scope.name = 'modal' + idModal++;

            scope.animationsEnabled = true;

            /*****************************************************
            *               METHODS - PRIVATE                   *
            *****************************************************/

            var initialize = function () {
                /*@description: if declared onRegisterApi(callback) at options 
                 * create on object with callbacks and information about current modal
                 */
                if (typeof scope.options.onRegisterApi == "function") {
                    var advancedApi = {
                        events: {
                            open: scope.open
                        },
                        name: scope.name,
                        on: {
                            close: function (callback) {
                                return scope.$on('modal:' + scope.name + ':close', function (event, args) {
                                    callback(args);
                                })
                            },
                            open: function (callback) {
                                return scope.$on('modal:' + scope.name + ':open', function (event, args) {
                                    callback(args, scope.$parent);
                                });
                            },
                            ok: function (callback) {
                                return scope.$on('modal:' + scope.name + ':ok', function (event, args) {
                                    callback(args, scope.$parent);
                                })
                            }
                        }
                    }
                    /*
                     * @description: fire onRegisterApi and send advancedApi object
                     * @param {advancedApi}: object of informations and callbacks about current modal
                     * @param {parentScope}
                     */
                    scope.options.onRegisterApi(advancedApi, scope.$parent);
                }
            };




            /*****************************************************
             *                  METHODS                          *
             *****************************************************/

            /*
             * @description: on open modal create uibModalInstance and send options.modalScope 
             */
            scope.open = function (size) {
                var modalScope = {};

                modalScope = angular.copy(scope.options.modalScope) || {};

                scope.$broadcast('modal:' + scope.name + ':open', { modalScope: modalScope });

                var ModalInstance = $uibModal.open({
                    animation: scope.animationsEnabled,
                    templateUrl: 'gic-modal-template.html',
                    windowClass: 'gic-modal-window',
                    size: scope.options.size || '',
                    resolve: {
                        data: function () {
                            return {
                                templateUrl: scope.options.templateUrl,
                                template: scope.options.template,
                                title: scope.options.title,
                                modalScope: modalScope,
                                showModal: scope.options.showModal === false ? false : true,
                                confirmOk: scope.options.confirmOk,
                                buttons: {
                                    ok: scope.options.okButton || 'OK',
                                    cancel: scope.options.cancelButton || 'CANCEL',
                                },
                            }
                        }
                    },
                    controller: function ($scope, $uibModalInstance, data) {
                        'ngInject';
                        // TODO: add validation if close modal
                        $scope.ok = function () {
                            $scope.form.$setSubmitted();
                            if (!$scope.form.$valid) {
                                $scope.valid = false;
                                return;
                            }

                            if (_.isFunction(data.confirmOk)) {
                                var close = data.confirmOk($scope.modalScope);
                                if (close) $uibModalInstance.close({ modalScope: $scope.modalScope });
                            }
                            else {

                                $uibModalInstance.close({ modalScope: $scope.modalScope });
                            }

                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                        $scope.title = data.title;
                        $scope.showModal = data.showModal; //default true
                        $scope.modalScope = data.modalScope;
                        $scope.templateUrl = data.templateUrl;
                        $scope.template = data.template;
                        $scope.buttons = data.buttons;
                        $scope.valid = true;
                    },

                });

                ModalInstance.result.then(function (data) {
                    scope.$broadcast('modal:' + scope.name + ':ok', data);
                }, function () {
                    scope.$broadcast('modal:' + scope.name + ':close');
                });
            };




            /*****************************************************
             *                  EXECUTIONS                       *
             *****************************************************/

            initialize();
        }
    }


})();