app.controller('EventsController', ['$scope', '$http', '$cookies', '$location', '$route', '$routeParams',
    function ($scope, $http, $cookies, $location, $route, $routeParams) {
        var EDIT_ID_COOKIE_LABEL = "eventsEditId",
            ALERTS_COOKIE_LABEL = "eventsAlerts";

        var initialize = function () {
            $scope.events = [];

            $scope.new = {
                title: ""
            };

            if ($location.path().split('/')[$location.path().split('/').length - 1] === 'edit' && !$scope.editPermissions) {
                $location.url('/events');
            }
        };
        initialize();

        var loadData = function () {
            $scope.dataLoaded = false;
            $scope.events = [];

            $http.get('/api/events/').then(function (response) {
                $scope.events = response.data;
                $scope.events.forEach(function(elem) {
                    elem.date = new Date(elem.date);
                    elem.start_string = elem.start;
                    elem.start = new Date('Thu, 01 Jan 1970 ' + elem.start + ' GMT-0500');
                    if(elem.end) {
                        elem.end_string = elem.end;
                        elem.end = new Date('Thu, 01 Jan 1970 ' + elem.end + ' GMT-0500');
                    }
                });

                $scope.currentEditId = $cookies.getObject(EDIT_ID_COOKIE_LABEL) ?
                    $cookies.getObject(EDIT_ID_COOKIE_LABEL).val : ($scope.events[0] ? $scope.events[0].event_id : 0);
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();

        /**
         * Function that's called immediately to load any pending alerts for display
         */
        var initiateAlerts = function () {
            if ($cookies.getObject(ALERTS_COOKIE_LABEL) === undefined) {
                $scope.showAlerts = false;
                $scope.alerts = [];
            } else {
                $scope.showAlerts = true;
                $scope.alerts = $cookies.getObject(ALERTS_COOKIE_LABEL).array;
            }
        };
        initiateAlerts();

        /**
         * Generates a new alert, adds it to the alert array, and displays it.
         * @param type
         * @param message
         * @param from
         */
        var addNewAlert = function (type, message, from) {
            if (type != 'error' && type != 'success') {
                type = 'info';
            }

            for (var i = 0; i < $scope.alerts.length; i++) {
                if ($scope.alerts[i].from == from) {
                    $scope.alerts.splice(i, 1);
                    break;
                }
            }

            $scope.alerts.push({
                type: type,
                message: message,
                from: from
            });
            $cookies.putObject(ALERTS_COOKIE_LABEL, {array: $scope.alerts}, {expires: new Date(new Date().getTime() + 300000)});
        };

        /**
         * Called by the 'close' button on any alert; removes it from the alert array
         * @param index
         */
        $scope.removeAlert = function (index) {
            $scope.alerts.splice(index, 1);
            $cookies.putObject(ALERTS_COOKIE_LABEL, {array: $scope.alerts}, {expires: new Date(new Date().getTime() + 300000)});
        };

        $scope.setEditId = function (newId) {
            $scope.currentEditId = newId;
        };

        $scope.$on('$routeChangeStart', function () {
            if ($location.path().split('/')[$location.path().split('/').length - 1] === 'edit') {
                $cookies.putObject(EDIT_ID_COOKIE_LABEL, {val: $scope.currentEditId});
            }
        });

        /**
         * Finds an event's index in the event array based on the ID
         * @param id
         * @returns {number}
         */
        var findEvent = function (id) {
            var position = -1;

            $scope.events.forEach(function (elem, index) {
                if (elem.event_id == id) {
                    position = index;
                }
            });

            return position;
        };
    }]);
