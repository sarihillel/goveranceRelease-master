(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('ngSwitchWhenExpDirective', ngSwitchWhenExpDirective);

    /*
   * @description: copied from angular.js ng-sw-when directive and added chek by descriprtion
   * @author:rivki aizen 07/11/2016
   */

    function ngSwitchWhenExpDirective() {
        'ngInject'

        var directive = {
            transclude: 'element',
            priority: 1200,
            require: '^ngSwitch',
            multiElement: true,
            link: function (scope, element, attrs, ctrl, $transclude) {
                var ngSwitchWhenExp = scope.$eval(attrs.ngSwitchWhenExp);
                ctrl.cases['!' + ngSwitchWhenExp] = (ctrl.cases['!' + ngSwitchWhenExp] || []);
                ctrl.cases['!' + ngSwitchWhenExp].push({ transclude: $transclude, element: element });
            }
        }

        return directive;
    }


})();
