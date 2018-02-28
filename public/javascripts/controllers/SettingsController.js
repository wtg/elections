import app from '../module';

app.controller('SettingsController', ['$scope', '$http', '$cookies', '$location', '$route', '$routeParams',
    function ($scope, $http, $cookies, $location, $route, $routeParams) {

        var ALERTS_COOKIE_LABEL = "settingsAlerts";

        var SELECT_INIT = "Select an election...";
        var SELECT_NONE = "No elections found!";
        var SELECT_NEW = "Creating new election...";
        var SELECT_EDIT = "Currently editing: ";
        var SELECT_ACTIVE = " (active)";

        var loadData = function () {
            $scope.dataLoaded = false;
            $scope.settings = [];
            $scope.elections = [];
            $scope.fieldHasError = [];
            $scope.new = {
                election_name: "", primary_date: null, final_date: null, runoff_date: null,
                maintenance_message: ""
            };
            $scope.blankElectionChoice = SELECT_INIT;
            $scope.activeElectionID = 0;
            $scope.electionErrorText = '';

            $http.get('/api/settings/').then(function (response) {
                response.data.forEach(function (elem) {
                    $scope.settings.push(elem);
                    if (elem.key === "active_election_id") {
                        $scope.activeElectionID = elem.value/1;
                    }
                    if (elem.key === "maintenance_message") {
                        $scope.new.maintenance_message = elem.value;
                    }
                });
            }).then($http.get('/api/elections/').then(function (response) {
                response.data.forEach(function(elem) {
                    elem.primary_date = new Date(elem.primary_date);
                    elem.final_date = new Date(elem.final_date);
                    elem.runoff_date = new Date(elem.runoff_date);
                    $scope.elections.push(elem);
                });
                if ($scope.elections.length === 0) {
                    $scope.blankElectionChoice = SELECT_NONE;
                }
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

        $scope.prettifyElectionName = function (elem) {
            var el_string = elem.election_name;
            if ($scope.activeElectionID === elem.election_id) {
                el_string += SELECT_ACTIVE;
            }
            if ($scope.creatingElection) {
                el_string = SELECT_NEW;
            }
            if ($scope.editingElection) {
                el_string = SELECT_EDIT + el_string;
            }
            return el_string;
        };

        $scope.setElEditMode = function(mode, e) {
            $scope.fieldHasError = [];
            $scope.electionErrorText = "";
            if (mode === "create") {
                $scope.blankElectionChoice = SELECT_NEW;
                $scope.creatingElection = true;
                return;
            }
            else if (mode === "edit") {
                $scope.revertTo = angular.copy(e);
                $scope.editingElection = true;
                return;
            }
            else if (mode === "save") {
                if ($scope.creatingElection) {
                    var preparedData = {
                        election_name: $scope.new.election_name,
                        primary_date: $scope.new.primary_date,
                        final_date: $scope.new.final_date,
                        runoff_date: $scope.new.runoff_date
                    };

                    if (!$scope.validateForm(preparedData)) return;

                    $http.post('/api/elections/create', preparedData).then(function () {
                        //addNewAlert("success", "The new election, entitled " + election_name + ", was created successfully!", "create");
                        $route.reload();
                    }, function (response) {
                        //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "create");
                    });
                }
                else if ($scope.editingElection) {
                    var preparedData = {
                        election_name: e.election_name,
                        primary_date: e.primary_date,
                        final_date: e.final_date,
                        runoff_date: e.runoff_date
                    };
                    if (!$scope.validateForm(preparedData)) return;
                    $http.put('/api/elections/update/' + e.election_id, preparedData).then(function () {
                        //addNewAlert("success", "The election entitled " + e.election_name + " was successfully updated!", "update");
                        $route.reload();
                    }, function (response) {
                        //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "update");
                    })
                }
            }
            else if (mode === "off") {
                if ($scope.creatingElection) {
                    $scope.new = [];
                }
                else if ($scope.editingElection) {
                    angular.copy($scope.revertTo, e);
                }
            }
            else {
                return;
            }
            if ($scope.elections.length === 0) {
                $scope.blankElectionChoice = "No elections found!";
            }
            else {
                $scope.blankElectionChoice = SELECT_INIT;
            }
            $scope.creatingElection = $scope.editingElection = false;
        }

        $scope.validateForm = function(data) {
          var failedFields = 0;
          $scope.fieldHasError = [];
          for (var key in data) {
              if (!data[key]) {
                  $scope.fieldHasError[key] = true;
                  failedFields++;
              }
          }
          if (failedFields) {
              $scope.electionErrorText = "Invalid data. Please try again.";
              return false;
          }
          else {
              data.primary_date = data.primary_date.toISOString().substr(0,10);
              data.final_date = data.final_date.toISOString().substr(0,10);
              data.runoff_date = data.runoff_date.toISOString().substr(0,10);
              return true;
          }
        }

        $scope.deleteElection = function(e) {
            if (!confirm("Are you sure you want to permanently delete this event? \"" + e.election_name + "\" will not be recoverable!") ||
                    !confirm("Are you super sure? \"" + e.election_name + "\" will be GONE FOREVER!")) {
                return;
            }

            // Deactivate the election before deleting
            if($scope.activeElectionID === e.election_id) { $scope.setActiveEl(e); }

            $http.delete('/api/elections/delete/' + e.election_id).then(function () {
                //addNewAlert("success", "The election entitled " + election_name + " was permanently deleted!", "delete");
                $route.reload();
            }, function (response) {
                //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "delete");
            })
        }

        $scope.setActiveEl = function (e) {
            var preparedData = { value: "" };
            if ($scope.activeElectionID === e.election_id) { preparedData.value = "0"; }
            else { preparedData.value = e.election_id; }
            $http.put('/api/settings/update/active_election_id', preparedData).then(function () {
                //addNewAlert("success", "The setting, " + key + ", was updated successfully!", "create");
                $route.reload();
            }, function (response) {
                //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "create");
            });
        }

        $scope.toggleMaintenance = function() {
            var preparedData = { value: "" };
            if ($scope.maintenanceMode) { preparedData.value = "0"; }
            else { preparedData.value = "1" }
            $http.put('/api/settings/update/maintenance_mode', preparedData).then(function () {
                //addNewAlert("success", "The setting, " + key + ", was updated successfully!", "create");
                window.location.reload();
                // maintenance mode relies on index.html to display properly
                // entire page needs to be reloaded
            }, function (response) {
                //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "create");
            });
        }
        $scope.saveMaintenanceMessage = function() {
            var preparedData = { value: $scope.new.maintenance_message };
            $http.put('/api/settings/update/maintenance_message', preparedData).then(function () {
                //addNewAlert("success", "The setting, " + key + ", was updated successfully!", "create");
                window.location.reload();
                // a message change relies on index.html to display properly
                // entire page needs to be reloaded
            }, function (response) {
                //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "create");
            });
        }
    }]);
