(function () {
    'use strict';

    angular
        .module('gicApp')
        .service('gicDataList', gicDataList);

    gicDataList.$inject = ['gicApi', '$q', '$filter'];

    //TODO: check if cash http and time expire
    function gicDataList(gicApi, $q, $filter) {

        var cashItems = {};
        /*****************************************************
        *                  METHODS                          *
        *****************************************************/
        //home page
        this.searchGovernanceRelease = _searchGovernanceRelease;

        //wizard data
        this.getGovernanceReleaseById = _getGovernanceReleaseById;

        //wizard info data
        this.getReleaseConfig = _getReleaseConfig;

        //wizard releaseInfo
        this.getAcounts = _getAcounts;
        this.getReleaseTypes = _getReleaseTypes;
        this.getReleases = _getReleases;
        this.getGovernanceReleases = _getGovernanceReleases;
        this.getGovernanceAcounts = _getGovernanceAcounts;
        this.isGovernanceReleaseExists = _isGovernanceReleaseExists;

        //wizard stakeholders
        this.getUsers = _getUsers;
        this.getStakeholders = _getStakeholders;

        //wizard reports
        this.getFrequencies = _getFrequencies;
        this.getProjectPhases = _getProjectPhases;
        //this.getReportsStreams = _getReportsStreams;

        //buttons
        this.saveGovernanceRelease = _saveGovernanceRelease;
        this.sendEmail = _sendEmail;

        this.toOptions = _toOptions;

        /*****************************************************
       *               METHODS - PRIVATE                   *
       *****************************************************/
        /*
         * @description: get fields list and return dictionary list [{name:'' ,value: ''}]
         * @param: {list} array of objects
         */
        function _toOptions(list, key, name) {
            //return _.map(list, function (obj) {
            //    return {
            //        value: _.get(obj, key),
            //        name: _.get(obj, name)
            //    }
            //});
            var dict = [];
            _.forEach(list, function (obj) {
                dict[_.get(obj, key)] = _.get(obj, name);
            });
            return dict;
        }

        /*
         * @description: search governance release by term
         * @param:{term} term to search by
         */
        function _searchGovernanceRelease(term) {
            var defer = $q.defer();
            var params = {
                term: term
            };
            gicApi.getData(gicApi.resources.governance_release.search, params).then(function success(response) {
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
       * @description: get GovernanceRelease Data by u_release_dms that Publisheded 
       * @param: {u_release_id} Id of release 
       */
        function _getGovernanceReleaseById(u_release_id) {
            var defer = $q.defer();
            var params = {
                u_release_id: u_release_id
            };
            gicApi.getData(gicApi.resources.governance_release.getById, params).then(function success(response) {
                var list = response.data.list;
                //TODO: to remove it
                //list = _.filter(list, { u_release_status: 'Published' });
                var data = _.concat($filter('filter')(response.data.list, { sys_id: u_release_id }), [])[0];
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
            gicApi.getData(gicApi.resources.account.getAll).then(function success(response) {
                var list = response.data.list;
                if (isOptions) list = _toOptions(list, 'sys_id', 'u_account_name');
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }

        /*
         * @description: get all accounts from server that Publisheded and by u_release_type 
         * @param: {u_release_type} get by u_release_type 
         * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
         */
        function _getGovernanceAcounts(isOptions, u_release_type) {
            var defer = $q.defer();
            var params = {
                u_release_type: u_release_type
            };
            gicApi.getData(gicApi.resources.governance_release.search).then(function success(response) {
                var list = response.data.list;
                list = _.filter(list, { u_release_type: u_release_type, u_release_status: 'Published' });
                list = _.uniqBy(list, 'u_account_dms');
                if (isOptions) list = _toOptions(list, 'u_account_dms', 'u_account_name');
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            });
            return defer.promise;
        }

        /*
         * @description: get releases by u_account_dms and by u_release_type that is Publisheded
         * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
         * @param: {u_release_type} get by u_release_type 
         * @param {u_account_dms}: int, to filter by u_account_dms 
         */
        function _getGovernanceReleases(isOptions, u_release_type, u_account_dms) {
            var defer = $q.defer();
            var params = {
                u_release_type: u_release_type,
                u_account_dms: u_account_dms
            };
            gicApi.getData(gicApi.resources.governance_release.search, params).then(function success(response) {
                var list = response.data.list;
                //TODO: to delete when not working with mock
                list = _.filter(list, { 'u_release_type': u_release_type, 'u_release_status': 'Published', 'u_account_dms': u_account_dms });
                if (isOptions) list = _toOptions(list, 'u_release_id', 'u_release_name');
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;
        }

        /*
        * @description: find if gic release exsits or not
        * @param: {sys_id}: current sys_id (to exclude it from searching)
        * @param {governanceReleaseKeys}: object of{u_account_dms,u_release_dms,u_release_type/u_release_name} keys to search by
        * @returns promise<bool>: if exists or not
        */
        function _isGovernanceReleaseExists(sys_id, governanceReleaseKeys) {
            var defer = $q.defer();
            var params = _.extend({ sys_id: sys_id }, governanceReleaseKeys);
            gicApi.getData(gicApi.resources.governance_release.isExists, params).then(function success(response) {
                var list = response.data.list;
                //if not add mode
                if (_.toNumber(sys_id))
                    _.remove(list, { "sys_id": sys_id });

                list = _.concat(_.filter(list, governanceReleaseKeys), []);
                var isExists = list.length > 0;
                defer.resolve(isExists);
            },
            function error() {
                defer.reject(error);
            });
            return defer.promise;
        }

        /*
        * @description: get releases types 
        * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
       */
        function _getReleaseTypes(isOptions) {
            var defer = $q.defer();
            gicApi.getData(gicApi.resources.releaseType.getAll).then(function success(response) {
                var list = response.data.list;
                if (isOptions) list = _toOptions(list, 'sys_id', 'u_type_name');
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;
        }

        /*
         * @description: get releases types by u_account_dms from server
         * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
          * @param {AccountID}: int, to filter by u_release_type 
        */
        function _getReleases(isOptions, u_account_dms) {
            var defer = $q.defer();
            var params = {
                u_account_dms: u_account_dms
            };
            gicApi.getData(gicApi.resources.release.getByAccount, params).then(function success(response) {
                var list = response.data.list;
                //TODO: to delete when not working with mock
                list = _.filter(list, { u_account_dms: u_account_dms });
                if (isOptions) list = _toOptions(list, 'sys_id', 'u_release_dms');
                defer.resolve(list);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;
        }

        /*
        * @description: get goverance release config from server
        */
        function _getReleaseConfig(u_release_type) {
            var defer = $q.defer();
            var params = {
                u_release_type: u_release_type
            };
            gicApi.getData(gicApi.resources.governance_release.getReleaseConfig, params).then(function success(response) {
                //TODO: to remove it when working good
                // var list = _.concat(response.data.list || []);
                // var data = _.filter(list, { u_release_type: u_release_type })[0] || {};
                // var data = list[0] || {};
                var data = response.data;
                defer.resolve(data);
            },
            function error() {
                defer.reject(error);
            })
            return defer.promise;
        }

        /*
         * @description: get  users by term
         * @param {term}: string, search by in users table
         * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
         */
        function _getUsers(term) {
            var defer = $q.defer();
            var params = {
                term: term
            };
            gicApi
                .getData(gicApi.resources.user.getQuery, params)
                .then(function success(response) {
                    var list = response.data.list;
                    var list = _.take($filter('filter')(response.data.list, term), 20);
                    defer.resolve(list);
                }, function error() {
                    defer.reject(error);
                })
            return defer.promise;
        }

        /*
        * @description: get  all stakeholders from server 
        * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
        */
        function _getStakeholders(isOptions, u_release_type) {
            var defer = $q.defer();
            var params = {
                u_release_type: u_release_type
            }
            gicApi
                .getData(gicApi.resources.stakeholder.getAll, params)
                .then(function success(response) {
                    var list = response.data.list;
                    if (isOptions) list = _toOptions(list, 'sys_id', 'u_role_name');
                    defer.resolve(list);
                },
            function error() {
                defer.reject(error);
            })
            return defer.promise;

        }

        /*
        * @description: get  all frequencies from server 
        * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
        */
        function _getFrequencies(isOptions) {
            var defer = $q.defer();

            if (cashItems["Frequencies"])
                defer.resolve(cashItems["Frequencies"]);
            else
                gicApi
                    .getData(gicApi.resources.frequency.getAll)
                    .then(function success(response) {
                        var list = response.data.list;
                        if (isOptions) list = _toOptions(list, 'sys_id', 'u_frequency_name');
                        cashItems["Frequencies"] = list;
                        defer.resolve(list);
                    },
                function error() {
                    defer.reject(error);
                })
            return defer.promise;

        }

        /*
        * @description: get  all project phases from server 
        * @param {isOptions}: bool, if true retrun as {value: ,name:} dictionary 
        */
        function _getProjectPhases(isOptions) {
            var defer = $q.defer();
            if (cashItems["ProjectPhases"])
                defer.resolve(cashItems["ProjectPhases"]);
            else
                gicApi
                .getData(gicApi.resources.project_phase.getAll)
                .then(function success(response) {
                    var list = response.data.list;
                    if (isOptions) list = _toOptions(list, 'sys_id', 'u_project_phase_name');
                    cashItems["ProjectPhases"] = list;
                    defer.resolve(list);
                },
            function error() {
                defer.reject(error);
            })
            return defer.promise;
        }

        /*
       * @description: save Governance Release to db 
       * @param {gicReleaseData}: data of release
       */
        function _saveGovernanceRelease(gicReleaseData) {
            var defer = $q.defer();
            var params = {
                gicReleaseData: gicReleaseData
            };

            //TODO:to remove it when it saved
            var isSaved = Math.random() < .5;
            if (isSaved) {
                var sys_id = gicReleaseData.sys_id;
                if (!sys_id) sys_id = Math.random() * 100 + 5;
                defer.resolve(sys_id);
            }
            else
                defer.reject(false);
            //gicApi
            //   .getData(gicApi.resources.governance_release.save, params)
            //   .then(function success(response) {
            //       var sys_id = response.data.sys_id;
            //       defer.resolve(sys_id);
            //   });
            return defer.promise;
        }

        function _sendEmail(list) {
            var defer = $q.defer();
            var params = {
                list: list
            };

            //TODO:to remove it when it saved
            var isOK = Math.random() < .5;
            if (isOK) {
                defer.resolve(isOK);
            }
            else
                defer.reject(false);
            //gicApi
            //   .getData(gicApi.resources.governance_release.sendMail, params)
            //   .then(function success(response) {
            //       var sys_id = response.data.sys_id;
            //       defer.resolve(sys_id);
            //   });
            return defer.promise;
        }
     
    }
})();