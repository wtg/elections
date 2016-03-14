app.controller('SettingsController', ['$scope', '$http', '$cookies', '$location', '$route', '$routeParams',
    function ($scope, $http, $cookies, $location, $route, $routeParams) {
        var ALERTS_COOKIE_LABEL = "settingsAlerts";

        var loadData = function () {
            $scope.dataLoaded = false;
            $scope.settings = [];
            $scope.elections = [];
            $scope.active_election_id_ind = 0;
            $scope.active_election_id = 0;

            $http.get('/api/settings/').then(function (response) {
                response.data.forEach(function (elem) {
                    $scope.settings.push(elem);
                    if (elem.key === "active_election_id") {
                      $scope.active_election_id = elem.value/1;
                      $scope.active_election_id_ind = elem.key;
                    }
                });
            }).then($http.get('/api/settings/elections/').then(function (response) {
                response.data.forEach(function(elem) {
                    $scope.elections.push(elem);
                });
            }).finally(function () {
                $scope.dataLoaded = true;
            }));
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
            $scope.showAlerts = true;
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
            $cookies.putObject(ALERTS_COOKIE_LABEL, {array: $scope.alerts});
        };

        /**
         * Called by the 'close' button on any alert; removes it from the alert array
         * @param index
         */
        $scope.removeAlert = function (index) {
            $scope.alerts.splice(index, 1);
            $cookies.putObject(ALERTS_COOKIE_LABEL, {array: $scope.alerts});
        };

        $scope.numSettings = function () {
          return $scope.settings.length;
        };

        $scope.prettifyElectionName = function (elem) {
            var active = false;
            var el_string = elem.election_name;
            if ($scope.active_election_id === elem.election_id) {
                el_string += " (active)";
            }
            return el_string;
        };

        $scope.setActiveEl = function (e) {
          var preparedData = {
              value: e.election_id
          };
          $http.put('/api/settings/update/active_election_id', preparedData).then(function () {
              //addNewAlert("success", "The setting, " + key + ", was updated successfully!", "create");
              $route.reload();
          }, function (response) {
              //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "create");
          });
        }
    }]);
