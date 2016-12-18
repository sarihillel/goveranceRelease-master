(function () {
    'use strict';

    angular
        .module('gicApp')
        .service('gicReleaseDataService', gicReleaseDataService);

    gicReleaseDataService.$inject = ['$q', '$filter'];

    //TODO: check if cash http and time expire
    function gicReleaseDataService($q, $filter) {
        var vm = this;
        /*****************************************************
        *                  VARIABLES                          *
        *****************************************************/
        vm.enums = {
            vendor_customer_type: {
                Customer: "Customer",
                Vendor: "Vendor"
            },
            release_status: {
                Draft: "Draft",
                Published: "Published"
            },
            is_required: {
                No: "No",
                Yes: "Yes"
            }
        }

        vm.gicReleaseData = {};
        vm.stakeholdersOwnerSearch = [];
        /*****************************************************
        *               METHODS - PUBLIC                   *
        *****************************************************/

        //base+releaseinfo
        vm.mapStakholdersToTempId = _mapStakholdersToTempId;

        //stakeholder-vendor
        vm.getNextStakeholderTempId = _getNextStakeholderTempId;
        vm.getNextVendorTempId = _getNextVendorTempId;
        vm.getStakeholdersNotManual = _getStakeholdersNotManual;

        //reports|meetings owner/recipts
        vm.getReportsStreamList = _getReportsStreamList;
        vm.getReportsStreamOptions = _getReportsStreamOptions;
        vm.getStakeholdersOwnerSearch = _getStakeholdersOwnerSearch;
        vm.getStakeholdersVendorSearch = _getStakeholdersVendorSearch;
        vm.getUserNamesStakeholderVendorByTempId = _getUserNamesStakeholderVendorByTempId;

        //prosond_reports
        vm.getUserMeetings = _getUserMeetings;
        vm.getUserMeetingsParticipating = _getUserMeetingsParticipating;
        vm.getUserReports = _getUserReports;
        vm.getUserReportsParticipating = _getUserReportsParticipating;
        vm.getPMOMeetings = _getPMOMeetings;
        vm.getPMOReports = _getPMOReports;
        vm.getUserStakeholders = _getUserStakeholders;
        vm.isPMO = _isPMO;
        /*****************************************************
       *               METHODS - PRIVATE                   *
       *****************************************************/

        

        
        /*
         * @description: sets vm.gicReleaseData.stakeholders[.temp_id] , 
         *              needs for identify report/meeting owner and recipts
         */
        function _mapStakholdersToTempId(isConfig) {
            if (!vm.gicReleaseData.stakeholders) return;
            _.forEach(vm.gicReleaseData.stakeholders, function (obj, index) {
                obj.temp_id = (index + 1).toString() + 'Stakeholder';
            });

            _.forEach(vm.gicReleaseData.vendor_customers, function (obj, index) {
                obj.temp_id = (index + 1).toString() + 'Vendor';
            });


            //reports temp_id
            var field = isConfig ? 'u_stakeholder_role' : 'sys_id';
            _.forEach(vm.gicReleaseData.proposed_reports, function (report) {

                //sets vm.gicReleaseData.proposed_reports[.u_report_owner_temp]
                var stakeholder = _.find(vm.gicReleaseData.stakeholders, function (obj) {
                    return obj[field] == report.u_report_owner;
                });
                if (stakeholder)
                    report.u_report_owner_temp = stakeholder.temp_id;

                //sets vm.gicReleaseData.proposed_reports[.u_report_recipients_temp]
                report.u_report_recipients_temp = [];
                _.forEach(report.u_report_recipients, function (recipt) {
                    var stakeholder = _.find(vm.gicReleaseData.stakeholders, function (obj) {
                        return obj[field] == recipt;
                    });
                    if (stakeholder)
                        report.u_report_recipients_temp.push(stakeholder.temp_id);
                });
                _.forEach(report.u_report_recipients_vendor, function (recipt) {
                    var stakeholder = _.find(vm.gicReleaseData.vendor_customers, function (obj) {
                        return obj.sys_id == recipt;
                    });
                    if (stakeholder)
                        report.u_report_recipients_temp.push(stakeholder.temp_id);
                });
            });

            //proposed_meetings temp_id
            var field = isConfig ? 'u_stakeholder_role' : 'sys_id';
            _.forEach(vm.gicReleaseData.proposed_meetings, function (meeting) {

                //sets vm.gicReleaseData.proposed_reports[.temp_id]
                var stakeholder = _.find(vm.gicReleaseData.stakeholders, function (obj) {
                    return obj[field] == meeting.u_meeting_owner;
                });
                if (stakeholder)
                    meeting.u_meeting_owner_temp = stakeholder.temp_id;

                //sets vm.gicReleaseData.proposed_reports[.u_meeting_invitees_temp]
                meeting.u_meeting_invitees_temp = [];
                _.forEach(meeting.u_meeting_invitees, function (invitee) {
                    var stakeholder = _.find(vm.gicReleaseData.stakeholders, function (obj) {
                        return obj[field] == invitee;
                    });
                    if (stakeholder)
                        meeting.u_meeting_invitees_temp.push(stakeholder.temp_id);
                });
                _.forEach(meeting.u_meeting_vendor_invitees, function (invitee) {
                    var stakeholder = _.find(vm.gicReleaseData.vendor_customers, function (obj) {
                        return obj.sys_id == invitee;
                    });
                    if (stakeholder)
                        meeting.u_meeting_invitees_temp.push(stakeholder.temp_id);
                });
            });
        }

        function _getNextStakeholderTempId() {
            return (vm.gicReleaseData.stakeholders.length + 1).toString() + 'Stakeholder';
        }

        function _getNextVendorTempId() {
            return (vm.gicReleaseData.vendor_customers.length + 1).toString() + 'Vendor';
        }

        /*
         * @description: for options select
         * @event: fire on load stakeholders step, 
         * @returns: list of array of stakeholders from stakeholders table
         */
        function _getStakeholdersNotManual() {
            return _.filter(vm.gicReleaseData.stakeholders, function (obj) {
                return !!obj.u_stakeholder_role;
            });
        }

        /*
         * @description: grouping proposed_reports by stream name 
         * @event: fire on load proposed_reports
         * @returns: list of key(u_stream_name), value: list of proposed_reports of that key
         */
        function _getReportsStreamList() {
            return _.groupBy(_.orderBy(vm.gicReleaseData.proposed_reports, ['u_stream_order', 'u_order']), 'u_stream_name');
        }

        /*
         * @description: for adding new row to list
         * @event: fire on load proposed_reports
         * @returns:  list ooptions of streams of group
         */
        function _getReportsStreamOptions(streamList) {
            return _.map(streamList, function (group) {
                var report = group[0];
                return {
                    u_stream_name: report.u_stream_name,
                    sys_id: report.u_report_stream,
                    u_stream_order: report.u_stream_order
                }
            });
        }

        /*
         * @description: for find owner of report/meeting
         * @event: fire on load proposed_reports or proposed_meetings 
         * @returns: list of sys_id and name of stakeholders
         */
        function _getStakeholdersOwnerSearch() {
            return _.map(vm.gicReleaseData.stakeholders, function (obj) {
                return {
                    sys_id: obj.temp_id,
                    name: (obj.user ? obj.user.name + ' - ' : '') + obj.u_role_name,
                }
            });
        }

        /*
         * @description: for find recipts of report/meeting
         * @event: fire on load proposed_reports or proposed_meetings 
         * @returns: list of sys_id and name of vendors
         */
        function _getStakeholdersVendorSearch() {
            return _.map(vm.gicReleaseData.vendor_customers, function (obj) {
                return {
                    sys_id: obj.temp_id,
                    name: obj.u_name + ' - ' + (obj.u_stakholder_role_name || obj.u_manual_role),
                }
            });
        }

        /*
        * @param: {temp_id} by temp_id of stakeholder/vendor
        * @returns: {bool}
        */
        function _isVendor(temp_id) {
            return _.endsWith(temp_id, 'Vendor')
        }


        function _getVendorByTempId(temp_id) {
            return _.find(vm.gicReleaseData.vendor_customers, { "temp_id": temp_id });;
        }

        function _getStakeholderByTempId(temp_id) {
            return _.find(vm.gicReleaseData.stakeholders, { "temp_id": temp_id });
        }


        /*
         * @param  {temp_id}: temp_id of stakeholder
         * @returns {string} user_sys_id 
         */
        function _getUserIdStakeholderByTempId(temp_id) {
            var stakeholder = _getStakeholderByTempId(temp_id);
            if (stakeholder && stakeholder.user) return stakeholder.user.sys_id.toString();
            return "";
        }

        /*
        * @param  {listOfTempId}: string | array of temp_id list
        * @event: fire on preview invitees
        * @returns {string} stakeholdders names joins by ","
        */
        function _getUserNamesStakeholderVendorByTempId(listOfTempId) {
            listOfTempId = _.concat([], listOfTempId); //if single force to be list
            var list = _.map(listOfTempId, function (temp_id) {
                if (_isVendor(temp_id)) {
                    var vendor = _getVendorByTempId(temp_id);
                    if (vendor && vendor.u_name) return vendor.u_name;
                    return "";
                }
                else {
                    var stakeholder = _getStakeholderByTempId(temp_id);
                    if (stakeholder && stakeholder.user) return stakeholder.user.name;
                    return "";
                }
            });
            return _.join(list, ", ");
        }


        /*
       * @param  {listOfTempId}: string | array of temp_id list
       * @event: fire on load preview 
       * @returns {array} list of proposed_meetings who's owner is current user 
       */
        function _getUserMeetings() {
            return _.filter(vm.gicReleaseData.proposed_meetings, function (obj) {
                return obj.u_is_required == vm.enums.is_required.Yes
                    && _getUserIdStakeholderByTempId(obj.u_meeting_owner_temp) == window.g_user.userID;
            });
        }

        /*
        * @event: fire on load preview 
        * @returns {array} list of proposed_meetings who's Participating is current user 
        */
        function _getUserMeetingsParticipating() {
            return _.filter(vm.gicReleaseData.proposed_meetings, function (obj) {
                return obj.u_is_required == vm.enums.is_required.Yes
                    && !!_.find(obj.u_meeting_invitees_temp, function (temp_id) {
                        return _getUserIdStakeholderByTempId(temp_id) == window.g_user.userID;
                    });
            });
        }


        /*
        * @event: fire on load preview 
        * @returns {array} list of proposed_reports who's owner is current user 
        */
        function _getUserReports() {
            return _.filter(vm.gicReleaseData.proposed_reports, function (obj) {
                return obj.u_is_required == vm.enums.is_required.Yes
                    && _getUserIdStakeholderByTempId(obj.u_report_owner_temp) == window.g_user.userID;
            });
        }

        /*
       * @event: fire on load preview 
       * @returns {array} list of proposed_reports who's Participating is current user 
       */
        function _getUserReportsParticipating() {
            return _.filter(vm.gicReleaseData.proposed_reports, function (obj) {
                return obj.u_is_required == vm.enums.is_required.Yes && !!_.find(obj.u_report_recipients_temp, function (temp_id) {
                    return _getUserIdStakeholderByTempId(temp_id) == window.g_user.userID;
                });
            });
        }

        /*
        * @event: fire on load preview 
        * @returns {array} list of proposed_meetings if current user  is pmo
        */
        function _getPMOMeetings() {
            return _.filter(vm.gicReleaseData.proposed_meetings, { u_is_required: vm.enums.is_required.Yes });
        }

        /*
        * @event: fire on load preview 
        * @returns {array} list of proposed_reports if current user  is pmo
        */
        function _getPMOReports() {
            return _.filter(vm.gicReleaseData.proposed_reports, { u_is_required: vm.enums.is_required.Yes });
        }

        /*
       * @event: fire on load preview 
       * @returns {array} list of stakeholders who's user is current user 
       */
        function _getUserStakeholders() {
            return _.filter(vm.gicReleaseData.stakeholders, function (obj) {
                return _.get(obj, "user.sys_id") == window.g_user.userID;
            });
        }

        /*
        * @event: fire on load preview 
        * @returns {bool} is current user is PMO stakeholder role
        */
        function _isPMO() {
            return !!_.find(vm.gicReleaseData.stakeholders, function (obj) {
                return _.get(obj, "user.sys_id") == window.g_user.userID
                    && obj.u_role_name == "PMO"
                && !!obj.u_stakeholder_role; //if from configuration and not manual
            });
        }

    }
})();