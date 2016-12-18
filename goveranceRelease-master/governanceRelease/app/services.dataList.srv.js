(function () {
    'use strict';

    angular
        .module('gicApp')
        .service('dataList', dataList);

    dataList.$inject = ['apiService', '$q', '$filter'];

    //TODO: check if cash http and time expire
    function dataList(apiService, $q, $filter) {
        /*****************************************************
        *                  METHODS                          *
        *****************************************************/
        //home page
        this.searchReleasesExists = _searchReleasesExists;

        //wizard data
        this.getReleaseData = _getReleaseData;

        //wizard releaseInfo
        this.getAcounts = _getAcounts;
        this.getReleaseTypes = _getReleaseTypes;
        this.getReleases = _getReleases;
        this.getReleasesExists = _getReleasesExists;
        this.getAcountsExists = _getAcountsExists;

        //wizard stakeholderDef
        this.getProgramManagements = _getProgramManagements;
        this.getStreamLeads = _getStreamLeads;

        this.toOptions = _toOptions;

        /*****************************************************
       *               METHODS - PRIVATE                   *
       *****************************************************/
        /*
       * @description: get fields list and return dictionary list [{name:'' ,value: ''}]
       * @param: {list} array of objects
       */
        function _toOptions(list, key, name) {
            return _.map(list, function (obj) {
                return {
                    value: _.get(obj, key),
                    name: _.get(obj, name)
                }
            });
        }


        /*
         * @description: search release by term
         * @param:{term} term to search by
         */
        function _searchReleasesExists(term) {
            var defer = $q.defer();
            apiService.getData(apiService.resources.release.search).then(function success(response) {
                //TODO: to remove it
                var list = $filter('filter')(response.data.list, term);
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }


        /*
       * @description: get Release Data by releaseID
       * @param: {releaseID} Id of release 
       */
        function _getReleaseData(releaseID) {
            var defer = $q.defer();
            apiService.getData(apiService.resources.release.getReleaseData).then(function success(response) {
                //TODO: to remove it
                var data = _.concat($filter('filter')(response.data.list, { ID: releaseID }), [])[0];
                defer.resolve(data);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }

        /*
         * @description: get all accounts from server
         * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
         */
        function _getAcounts(isOptions) {
            var defer = $q.defer();
            apiService.getData(apiService.resources.account.getAll).then(function success(response) {
                var list = response.data.list;
                if (isOptions) list = _toOptions(list, 'ID', 'name');
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }
        /*
         * @description: get all accounts from server
         * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
         */
        function _getAcountsExists(isOptions) {
            var defer = $q.defer();
            apiService.getData(apiService.resources.account.getExists).then(function success(response) {
                var list = response.data.list;
                if (isOptions) list = _toOptions(list, 'accountID', 'accountName');
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }

        /*
        * @description: get releases types by accountID from server
        * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
         * @param {accountID}: int, to filter by accountID 
       */
        function _getReleaseTypes(isOptions, accountID) {
            var defer = $q.defer();
            apiService.getData(apiService.resources.releaseType.getByAcount).then(function success(response) {
                var list = response.data.list;
                //TODO: to delete when not working with mock
                list = _.filter(list, { accountID: accountID });
                if (isOptions) list = _toOptions(list, 'ID', 'name');
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }



        /*
         * @description: get releases types by accountID from server
         * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
          * @param {releaseTypeID}: int, to filter by releaseTypeID 
        */
        function _getReleases(isOptions, releaseTypeID) {
            var defer = $q.defer();
            apiService.getData(apiService.resources.release.getByReleaseType).then(function success(response) {
                var list = response.data.list;
                //TODO: to delete when not working with mock
                list = _.filter(list, { releaseTypeID: releaseTypeID });
                if (isOptions) list = _toOptions(list, 'ID', 'name');
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }

        /*
        * @description: get releases by accountID from server that has releases
        * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
        * @param {accountID}: int, to filter by accountID 
        */
        function _getReleasesExists(isOptions, accountID) {
            var defer = $q.defer();
            apiService.getData(apiService.resources.release.getByAccountExists).then(function success(response) {
                var list = response.data.list;
                //TODO: to delete when not working with mock
                // releases = _.filter(releases, { accountID: accountID });
                if (isOptions) list = _toOptions(list, 'releaseID', 'releaseName');
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }

        /*
        * @description: get programManagements from server
        */
        function _getProgramManagements() {
            var defer = $q.defer();
            apiService.getData(apiService.resources.stakeholder.getProgramManagements).then(function success(response) {
                var list = response.data.list;
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }

        /*
       * @description: get streamLeads from server
       */
        function _getStreamLeads() {
            var defer = $q.defer();
            apiService.getData(apiService.resources.stakeholder.getStreamLeads).then(function success(response) {
                var list = response.data.list;
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }
    }
})();