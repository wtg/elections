app.controller('SettingsController', ['$scope', '$http', '$cookies', '$location', '$route', '$routeParams',
    function ($scope, $http, $cookies, $location, $route, $routeParams) {
        var ALERTS_COOKIE_LABEL = "settingsAlerts";

        var loadData = function () {
            $scope.dataLoaded = false;
            $scope.settings = [];
            $scope.elections = [];
            $scope.new = {
              election_name: "", primary_date: null, final_date: null, runoff_date: null
            };
            $scope.blankElectionChoice = "Select an election...";
            $scope.active_election_id = 0;

            $http.get('/api/settings/').then(function (response) {
                response.data.forEach(function (elem) {
                    $scope.settings.push(elem);
                    if (elem.key === "active_election_id") {
                      $scope.active_election_id = elem.value/1;
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
                  $scope.blankElectionChoice = "No elections found!";
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

        $scope.numSettings = function () {
          return $scope.settings.length;
        };

        $scope.prettifyElectionName = function (elem) {
            var active = false;
            var el_string = elem.election_name;
            if ($scope.active_election_id === elem.election_id) {
                el_string += " (active)";
            }
            if ($scope.creatingElection) {
              el_string = "Creating new election...";
            }
            if ($scope.editingElection) {
              el_string = "Currently editing: " + el_string;
            }
            return el_string;
        };

        $scope.setElEditMode = function(mode, e) {
          if (mode === "create") {
            $scope.blankElectionChoice = "Creating new election...";
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
                  primary_date: $scope.new.primary_date.toISOString().substr(0,10),
                  final_date: $scope.new.final_date.toISOString().substr(0,10),
                  runoff_date: $scope.new.runoff_date.toISOString().substr(0,10)
              };
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
                  primary_date: e.primary_date.toISOString().substr(0,10),
                  final_date: e.final_date.toISOString().substr(0,10),
                  runoff_date: e.runoff_date.toISOString().substr(0,10)
              };
              $http.put('/api/elections/update/' + e.election_id, preparedData).then(function () {
                  //addNewAlert("success", "The election entitled " + e.election_name + " was successfully updated!", "update");
                  $route.reload();
              }, function (response) {
                  //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "update");
              })
            }
          }
          else if (mode === "off") {
            angular.copy($scope.revertTo, e);
          }
          else {
            return;
          }
          if ($scope.elections.length === 0) {
            $scope.blankElectionChoice = "No elections found!";
          }
          else {
            $scope.blankElectionChoice = "Select an election...";
          }
          $scope.creatingElection = $scope.editingElection = false;
        }

        $scope.deleteElection = function(e) {

          if (!confirm("Are you sure you want to permanently delete this event? \"" + e.election_name + "\" will not be recoverable!") ||
                  !confirm("Are you super sure? \"" + e.election_name + "\" will be GONE FOREVER!")) {
              return;
          }

          // Deactivate the election before deleting
          if($scope.active_election_id === e.election_id) { $scope.setActiveEl(e); }

          $http.delete('/api/elections/delete/' + e.election_id).then(function () {
              //addNewAlert("success", "The election entitled " + election_name + " was permanently deleted!", "delete");
              $route.reload();
          }, function (response) {
              //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "delete");
          })
        }

        $scope.setActiveEl = function (e) {
          var preparedData = { value: "" };
          if ($scope.active_election_id === e.election_id) { preparedData.value = "0"; }
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
    }]);
