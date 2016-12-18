(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('gicModal', gicModal);

    gicModal.$inject = ['INPUT_TYPES', '$filter'];

    function gicModal($modal, $log, $filter) {
        var idModal = 0;

        var directive = {
            restrict: 'E',
            transclude: true,
            scope: {
                options: "<",
            },
            templateUrl: 'directives.gic-modal.tpl.html',
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
                            },
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
             * @description: on open modal create modalInstance and send options.modalScope 
             */
            scope.open = function (size) {
                var modalScope = angular.copy(scope.options.modalScope) || {};

                scope.$broadcast('modal:' + scope.name + ':open', { modalScope: modalScope });

                var modalInstance = $modal.open({
                    animation: scope.animationsEnabled,
                    templateUrl: 'gic-modal-template.html',
                    windowClass: 'gic-modal-window',
                    size: 'lg',
                    resolve: {
                        data: function () {
                            return {
                                templateUrl: scope.options.templateUrl,
                                template: scope.options.template,
                                title: scope.options.title,
                                modalScope: modalScope,
                                showModal: scope.options.showModal === false ? false : true,
                                buttons: {
                                    ok: scope.options.okButton || $filter('translate')('directives.modal.buttons.ok'),
                                    cancel: scope.options.cancelButton || $filter('translate')('directives.modal.buttons.cancel'),
                                },
                            }
                        }
                    },
                    controller: function ($scope, $modalInstance, data) {
                        'ngInject';
                        // TODO: add validation if close modal
                        $scope.ok = function () {
                            $modalInstance.close({ modalScope: $scope.modalScope });
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                        $scope.title = data.title;
                        $scope.showModal = data.showModal; //default true
                        $scope.modalScope = data.modalScope;
                        $scope.templateUrl = data.templateUrl;
                        $scope.template = data.template;
                        $scope.buttons = data.buttons;
                    },

                });

                modalInstance.result.then(function (data) {
                    scope.options.modalScope = data.modalScope;
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