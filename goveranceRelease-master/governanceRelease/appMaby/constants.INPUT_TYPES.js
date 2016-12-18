(function () {
    'use strict';


    var INPUT_TYPES = {
        STRING: 'string',
        NUMBER: 'number',
        EMAIL: 'email',
        SELECT: 'select',
        DATE: 'date',
        DATE_RANGE: 'dateRange',
        TEXTAREA: 'textarea',
        TIME: 'time',
        GRID: 'grid',
        LABEL: 'label',
        LABEL_CONCATENATED: 'label_concatenated',
        MODAL: 'modal',
        PHONE: 'phone',
        CHECKBOX: 'checkbox'
    };

    angular
        .module('gicApp')
        .constant('INPUT_TYPES', INPUT_TYPES);

  
})();