(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('gicDynamicFormGroupService', gicDynamicFormGroupService);

    gicDynamicFormGroupService.$inject = ['INPUT_TYPES', '$filter'];

    //uses: INPUT_TYPES,lodash,ouDateFormat-filter
    //ui-grid -comment
    function gicDynamicFormGroupService(INPUT_TYPES, $filter) {

        /*****************************************************
       *                  METHODS                          *
       *****************************************************/
        this.setGroupsValues = _setGroupsValues;
        this.setDataValues = _setDataValues;

        this.getAllFieldsWithValue = _getAllFieldsWithValue;
        this.getFieldValue = _getFieldValue;
        this.clearFieldValue = _clearFieldValue;
        this.toDictionary = _toDictionary;

        /*****************************************************
        *               METHODS - PRIVATE                   *
        *****************************************************/

        /*
         * @description: set inputs values from data 
         */
        function _setGroupsValues(data, groups, setGridData) {
            _.forEach(groups, function (group) {
                group.title = $filter('translate')(group.title);

                _.forEach(group.fields, function (field) {

                    field.title = $filter('translate')(field.title);

                    switch (field.type) {
                        case INPUT_TYPES.GRID:
                            var gridName = field.gridOptions.name;
                            var gridData = (_getProp(data, gridName) || []);
                            if (_.isFunction(setGridData))
                                gridData = setGridData(gridName, gridData);
                            field.gridOptions.data = gridData;
                            _setGridOptions(field);
                            break;
                        case INPUT_TYPES.TIME:
                            var fieldValue = _getProp(data, field.name);
                            field.value = new Date(1970, 0, 1, fieldValue ? fieldValue / 100 : 0, fieldValue ? fieldValue % 100 : 0, 0);
                            break;
                        default:
                            field.value = _getProp(data, field.name);
                            break;
                    }
                });
            });
        }

        function _setGridOptions(grid) {
            if (!grid.notShowDelete && !grid.$$initDelete) {
                grid.$$initDelete = true;
                var cellDelete = {
                    name: "delete",
                    displayName: "",
                    enableCellEdit: false,
                    exporterSuppressExport: true,
                    enableColumnResizing: false,
                    enableColumnMenu: false,
                    enableHiding: false,
                    width: '2%',
                    //maxWidth: 25,
                    cellTemplate: '<a ng-click="grid.appScope.DeleteRow(row)" class="delete-link">X</a>'
                }
                if (!_.filter(grid.gridOptions.columnDefs, { name: "delete" }).length)
                    grid.gridOptions.columnDefs.push(cellDelete);
            }
            grid.gridOptions.gridMenuShowHideColumns = false;
            grid.gridOptions.enableSorting = true;
            grid.gridOptions.rowEditWaitInterval = -1;
            grid.gridOptions.appScopeProvider = angular.extend({
                DeleteRow: function (row) {
                    _deleteGridRow(row, grid);
                },
                AddRow: function (gridName) {
                    _addGridRow(gridName, grid);
                }
            }, grid.gridOptions.appScopeProvider);
        }

        function _deleteGridRow(row, grid) {
            var index = grid.gridOptions.data.indexOf(row.entity);
            grid.gridOptions.data.splice(index, 1);
        }

        function _addGridRow(gridName, grid) {
            var newData = grid.gridOptions.data;
            newData.unshift({});;
        }

        function _setDataValues(data, groups, getGridData) {
            _.forEach(groups, function (group) {
                _.forEach(group.fields, function (input) {
                    if (input.type == INPUT_TYPES.GRID) {
                        var gridData = input.gridOptions.data;
                        var gridName = input.gridOptions.name;
                        if (_.isFunction(getGridData))
                            gridData = getGridData(gridName, gridData)
                        _.set(data, gridName, gridData)
                    }
                    else if (input.type == INPUT_TYPES.TIME) {
                        var date = $filter('date')(input.value, "HHmm");
                        _.set(data, input.name, date);
                    }
                    else {
                        if (input.name != '')
                            _.set(data, input.name, input.value);
                    }
                });
            });
        }
        /*
         * @description: 
         */
        function _getProp(data, name) {
            var val = _.get(data, name);
            if (typeof (val) == 'undefined')
                val = '';
            return val;
        }

        function _getAllFieldsWithValue(groupsFields) {
            var fields = _getAllFields(groupsFields);
            var fieldsWithData = _.filter(fields, function (field) {
                return !_isEmptyfield(field);
            });
            return fieldsWithData;
        }

        function _getAllFields(groupsFields) {
            return _.flatMap(groupsFields, function (group) { return group.fields; });
        }

        function _isEmptyfield(field) {
            var value = _getFieldValue(field, false)
            if (_.isObject(value))
                return _.compact(_.values(value)).length == 0;
            else
                return !value;
        }

        /*
         * @description: return field value
         * @param: {field} one field field 
         * @param: {isText} flag if return text or value
         */
        function _getFieldValue(field, isText) {
            if (field.type == INPUT_TYPES.SELECT) {
                if (isText)
                    return (field.value ? field.options[field.value] : "");
                else
                    return field.value;
            }
            else if (field.type == INPUT_TYPES.DATE_RANGE) {
                field.selected = field.selected || {};
                var from = field.selected.from || '';
                var to = field.selected.to || '';
                if (isText) {
                    return _getRangeText($filter('grDateFormat')(from), $filter('grDateFormat')(to));
                }
                else
                    return {
                        from: from,
                        to: to
                    };
            }
            else
                return field.value;
        }

        /*
        * @description: gets two range value and return text of value range
        * @param {from}: from value
        * @param {to}: to value
        */
        function _getRangeText(from, to) {
            var rangeValue = from ? from : '';
            rangeValue = rangeValue + (to ? '-' + to : '');
            return rangeValue;
        }

        /*
        * @description: clear field value
        * @param: {field} one field field 
        */
        function _clearFieldValue(field) {
            if (field.type == INPUT_TYPES.DATE_RANGE)
                delete field.selected;
            else field.value = '';
        }

        /*
         * @description: get fields list and return dictionary list [{name:'' ,value: ''}]
         * @param: {fields} all fields of groups as _getAllFields
         */
        function _toDictionary(fields) {
            return _.flatMap(fields, function (field) {
                var value = _getFieldValue(field, false);
                if (field.type == INPUT_TYPES.DATE_RANGE) {
                    return [{
                        name: field.nameFrom ? field.nameFrom : field.name + 'From',
                        value: value.from.toString(),
                    }, {
                        name: field.nameTo ? field.nameTo : field.name + 'To',
                        value: value.to.toString(),
                    }];
                }
                else
                    return {
                        name: field.name,
                        value: value.toString(),
                    };
            });
        }

    }



})();