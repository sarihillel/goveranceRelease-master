(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$location', '$http', 'dataList', '$state'];

    function homeCtrl($location, $http, dataList, $state) {
        /* jshint validthis:true */
        var vm = this;

        vm.getReleases = function (val) {
            return dataList.searchReleasesExists(val).then(function (list) {
                return list;
            });
        };

        vm.goToRelease = function ($item) {
            $state.go('wizard.releaseInfo', { releaseID: $item.ID });
        }

        activate();

        function activate() {

        }
    }
})();
