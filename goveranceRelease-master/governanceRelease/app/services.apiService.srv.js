(function () {
    'use strict';

    angular
        .module('gicApp')
        .service('apiService', apiService);

    apiService.$inject = ['$http'];
    var baseUrl = '../mock/'
    function apiService($http) {
        this.resources = {
            account: {
                getAll: {
                    url: baseUrl + 'accounts.json',
                    method: 'GET'
                },
                getExists: {
                    url: baseUrl + 'releasesGic.json',
                    method: 'GET'
                }
            },
            releaseType: {
                getByAcount: {
                    url: baseUrl + 'releaseTypes.json',
                    method: 'GET',
                }
            },
            release: {
                getByReleaseType: {
                    url: baseUrl + 'releases.json',
                    method: 'GET'
                },
                getByAccountExists: {
                    url: baseUrl + 'releasesGic.json',
                    method: 'GET'
                },
                search: {
                    url: baseUrl + 'releasesGic.json',
                    method: 'GET'
                },
                getReleaseData: {
                    url: baseUrl + 'releasesGicData.json',
                    method: 'GET'
                }

            },
            stakeholder: {
                getProgramManagements: {
                    url: baseUrl + 'programManagements.json',
                },
                getStreamLeads: {
                    url: baseUrl + 'streamLeads.json',
                },
            }
        };

        //TODO: check giledAjax, if can use with http - cahnge to use with resource
        //TODO: add mock to porject
        this.getData = function (urlResource) {
            if (urlResource.method == 'POST') {

            }
            else {
                return $http.get(urlResource.url);
            }
        }


    }
})();