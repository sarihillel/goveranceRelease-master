(function () {
    'use strict';

    angular
        .module('gicApp')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$location', '$http', 'gicDataList', '$state'];

    function homeCtrl($location, $http, gicDataList, $state) {
        /* jshint validthis:true */
        var vm = this;

        //TODO: to remove uib if not uses
        vm.listSearch = [];
        vm.getGoveranceReleases = function (val) {
            return gicDataList.searchGovernanceRelease(val).then(function (list) {
                vm.listSearch = list;
            });
        };

        vm.goToRelease = function ($item) {
            $state.go('wizard.releaseInfo', { u_release_id: $item.sys_id });
        }

        activate();

        function activate() {

        }
    }
})();


