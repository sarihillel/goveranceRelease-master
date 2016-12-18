(function () {
    'use strict';

    angular
        .module('gicApp')
        .service('gicApi', gicApi);

    gicApi.$inject = ['$http'];
    var baseUrl = '../mock/'
    function gicApi($http) {
        this.resources = {
            account: {
                getAll: {
                    url: baseUrl + 'accounts.json',
                    method: 'GET'
                }
            },
            governance_release: {
                search: {
                    url: baseUrl + 'governance_release_search.json',
                    method: 'GET'
                },
                getById: {
                    url: baseUrl + 'governance_release_by_id.json',
                    method: 'GET'
                },
                getReleaseConfig: {
                    url: baseUrl + 'release_config_by_type_id.json',
                },
                isExists: {
                    url: baseUrl + 'governance_release_search.json',
                },
                save: {
                    url: baseUrl + 'governance_release_save.json',
                    method:'POST'
                },
                sendMail: {
                    url: baseUrl + 'governance_release_send_mail.json',
                    method:'POST'
                }
            },
            releaseType: {
                getAll: {
                    url: baseUrl + 'release_types.json',
                    method: 'GET',
                }
            },
            release: {
                getByAccount: {
                    url: baseUrl + 'releases.json',
                    method: 'GET'
                }
            },
            user: {
                getQuery: {
                    url: baseUrl + 'users.json',
                    method: 'GET'
                }
            },
            stakeholder: {
                getAll: {
                    url: baseUrl + 'stakeholders.json',
                    method: 'GET'
                }
            },
            project_phase: {
                getAll: {
                    url: baseUrl + 'project_phase.json',
                    method: 'GET'
                }
            },
            frequency: {
                getAll: {
                    url: baseUrl + 'frequency.json',
                    method: 'GET'
                }
            },
            reports_stream: {
                getAll: {
                    url: baseUrl + 'reports_stream.json',
                    method: 'GET'
                }
            }
        };

        //TODO: check giledAjax, if can use with http - cahnge to use with resource
        //TODO: add mock to porject
        this.getData = function (urlResource,params) {
            if (urlResource.method == 'POST') {
                return $http.post(urlResource.url, params);
            }
            else {
                return $http.get(urlResource.url, params);
            }
        }


    }
})();