(function () {
    'use strict';


    angular
    .module('gicApp')
    .controller('gicDynamicFormGroup', gicDynamicFormGroup);

    gicDynamicFormGroup.$inject = ['INPUT_TYPES', '$filter'];


    /*
     * dynamic form by group 
     * 
     *     example: 
     *      var groups = [{
            title: 'title of group',
            fields: [{
                title: 'label 1',
                name: 'label1',
                type: "string"
            },
             {
                 title:'label 2',
                 name: 'label2',
                 type: "select",
                 options: [{
                     value: 1,
                     text: 'value1'
                 }, {
                     value: 2,
                     text: 'value2'
                 }],
                 selected: {
                     value: 1,
                     text: 'value1'
                 }
             },
              {
                  title: 'label 3',
                  name: 'label3',
                  type: "date"
              },
              {
                  title: 'label 3',
                  name: 'label3',
                  type: "date"
              },
              {
                  title: 'label 4',
                  name: 'label4',
                  type: "number",
              }
            ],
        }, {
            title: 'title of group',
            fields: [],
        },
        ];
    
        use:
        <gr-dynamic-form-group groups='groups'></gr-dynamic-form-group>
     */
    function gicDynamicFormGroup(INPUT_TYPES, $filter) {
        'ngInject'

        var directive = {
            restrict: 'E',
            scope: {
                groups: '=',
                options: '<',
            },
            templateUrl: 'directives.gic-dynamic-form-group.tpl.html',
            link: linkFunc
        };

        return directive;

        function linkFunc(scope, elem, attrs) {

            /* ***************************************************
                      VARIABLES
             **************************************************** */
            scope.INPUT_TYPES = INPUT_TYPES;
            scope.options = angular.extend({
                chunkGroups: 1,
                chunkFields: 2,         
                width: [5, 7],
                colSpanWidth: [2, '9 seperate-col'],
                cssForm: '',
                addPhone: '='
            }, scope.options)

            scope.chunkSm = {
                group: 12 / scope.options.chunkGroups,
                field: 12 / scope.options.chunkFields
            }
            /*****************************************************
            *               METHODS - PRIVATE                   *
            *****************************************************/
        
            var initialize = function () {
        
            };

            /*****************************************************
             *                  METHODS                          *
             *****************************************************/

            scope.getFieldSm = function (field) {
                return {
                    labelSm: 'col-sm-' + (!field.colSpan ? scope.options.width[0] : scope.options.colSpanWidth[0]).toString(),
                    inputSm: 'col-sm-' + (!field.colSpan ? scope.options.width[1] : scope.options.colSpanWidth[1]).toString()
                }
            }
            scope.getDate = function (val) {
                return $filter('ouToDate')(val, true);
            }

            /*****************************************************
             *                  EXECUTIONS                       *
             *****************************************************/

            initialize();
        

        
        }
    }

})();