(function () {
    'use strict';

    angular
        .module('gicApp')
        .directive('gicIncludeTemplate', gicIncludeTemplate);

    gicIncludeTemplate.$inject = ['$http', '$templateCache', '$compile'];

    /*
     * @description: like ng-include but not creats new scope
     * @param: {templateUrl}: if there is value get template and comile contects
     * @param: {gicIncludeTemplate}: (template) if there is not templateUrl attr search in gicIncludeTemplate and compile it
     */
    function gicIncludeTemplate($http, $templateCache, $compile) {
        'ngInject'

        var directive = {
            restrict: 'EA',
            link: function (scope, element, attrs) {
                //if (attrs.templateUrl)
                //	scope.$watch(attrs.templateUrl, function (value) {
                //    	if (value) {
                //        	loadTemplate(value);
                //    	}
                //	});
                //scope.$watch(attrs.gicIncludeTemplate, function (value) {
                //    if (value) {
                //        compileContent(scope.$eval(attrs.gicIncludeTemplate));
                //    }
                //});

                function loadTemplate(template) {
                    $http.get(template, { cache: $templateCache })
                      .success(function (templateContent) {
                          compileContent(templateContent);
                      });
                }

                function compileContent(templateContent) {
                    var wrapper = angular.element('<div>').html(templateContent);
                    element.empty().append($compile(wrapper.contents())(scope));
                }


                var initialize = function () {
                    if (attrs.templateUrl)
                        loadTemplate(attrs.templateUrl);
                    else
                        compileContent(scope.$eval(attrs.gicIncludeTemplate));
                }

                initialize();
            }

        };

        return directive;
    }


})();