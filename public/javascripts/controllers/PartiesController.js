app.controller('PartiesController', ['$scope', '$http', '$cookies', '$location', '$route',
    function ($scope, $http, $cookies, $location, $route) {
        var EDIT_ID_COOKIE_LABEL = "partiesEditId",
            ALERTS_COOKIE_LABEL = "partiesAlerts";

        var initialize = function () {
            $scope.parties = [];

            $scope.newOfficer = {
                rcs: ""
            };

            $scope.new = {
                name: "",
                platform: ""
            };

            if ($location.path().split('/')[$location.path().split('/').length - 1] === 'edit' && !$scope.editPermissions) {
                $location.url('/parties');
            }
        };
        initialize();

        var loadData = function () {
            $http.get('/api/parties/officers').then(function (response) {
                $scope.parties = response.data;

                $scope.currentEditId = $cookies.getObject(EDIT_ID_COOKIE_LABEL) ?
                    $cookies.getObject(EDIT_ID_COOKIE_LABEL).val : ($scope.parties[0] ? $scope.parties[0].party_id : 0);
                console.log($scope.currentEditId);
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();

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

        $scope.getLeader = function (party) {
            for(var i=0; i<party.officers.length; i++) {
                if(party.officers[i].is_highest === 1) {
                    return party.officers[i].rcs_id;
                }
            }

            return "N/A";
        };

        $scope.constructName = function (officer) {
            return (officer.preferred_name ? officer.preferred_name : officer.first_name) + " " + officer.last_name;
        };

        /**
         * Finds an party's index in the party array based on the ID
         * @param id
         * @returns {number}
         */
        var findParty = function (id) {
            var position = -1;

            $scope.parties.forEach(function (elem, index) {
                if (elem.party_id == id) {
                    position = index;
                }
            });

            return position;
        };

        $scope.promoteOfficer = function(rcsId, partyId) {
            if(rcsId === undefined || partyId === undefined) {
                return;
            }

            var name = $scope.parties[findParty(partyId)].name;

            $http.put('/api/parties/setleader/' + partyId + '/' + rcsId).then(function() {
                addNewAlert("success", rcsId + " was successfully promoted to party leader for " + name + "!", "promote_officer");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "promote_officer");
                console.log(response);
            });
        };

        $scope.removeOfficer = function(rcsId, partyId) {
            if(rcsId === undefined || partyId === undefined ||
                !confirm("Are you sure you want to remove " + rcsId + " as an officer of this party?")) {
                return;
            }

            var name = $scope.parties[findParty(partyId)].name;

            $http.delete('/api/parties/removeofficer/' + partyId + '/' + rcsId).then(function () {
                addNewAlert("success", rcsId + " was successfully removed as an officer for " + name + "!", "remove_officer");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "remove_officer");
                console.log(response);
            });
        };

        $scope.addOfficerKeypressEvent = function (keyEvent) {
            if (keyEvent.which === 13 && $scope.newOfficer.rcs) {
                $scope.addOfficer();
            }
        };

        /**
         * Adds a new candidate to a given office
         */
        $scope.addOfficer = function () {
            if (!$scope.newOfficer.rcs) {
                return;
            }
            console.log($scope.newOfficer.rcs);

            var name = $scope.parties[findParty($scope.currentEditId)].name;

            $http.post('/api/parties/addofficer/' + $scope.currentEditId + '/' + $scope.newOfficer.rcs).then(function () {
                addNewAlert("success", $scope.newOfficer.rcs + " was successfully added as an officer for " + name + "!", "add_officer");
                $scope.newOfficer.rcs = "";
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "add_officer");
                console.log(response);
            });
        };

        /**
         * Creates a new party
         */
        $scope.createParty = function () {
            var name = $scope.new.name;
            var preparedData = {
                name: $scope.new.name,
                platform: $scope.new.platform
            };

            if (!preparedData.name) {
                addNewAlert("error", "You didn't enter a title for the party!", "create");
                return;
            } else if (!preparedData.platform) {
                addNewAlert("error", "You didn't enter a platform for the party!", "create");
                return;
            }

            $http.post('/api/parties/create', preparedData).then(function () {
                addNewAlert("success", "The new platform, entitled " + name + ", was created successfully!", "create");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "create");
            });
        };

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
         * Saves any pending edits on the currently selected party
         */
        $scope.saveEdits = function () {
            var position = findParty($scope.currentEditId);
            var name = $scope.parties[position].name;

            if (isNaN($scope.currentEditId) || position == -1) {
                return;
            }

            var preparedData = {
                name: $scope.parties[position].name,
                platform: $scope.parties[position].platform
            };

            if (!preparedData.name) {
                addNewAlert("error", "You didn't enter a title for the party!", "update");
                return;
            } else if (!preparedData.platform) {
                addNewAlert("error", "You didn't enter a platform for the party!", "update");
                return;
            }

            $http.put('/api/parties/update/' + $scope.currentEditId, preparedData).then(function () {
                addNewAlert("success", "The " + name + " party was successfully updated!", "update");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "update");
            })
        };

        /**
         * Deletes an party based on the given edit id
         */
        $scope.deleteParty = function () {
            var position = findParty($scope.currentEditId);
            console.log(position);
            var name = $scope.parties[position].name;

            if (!confirm("Are you sure you want to permanently delete this office?") ||
                isNaN($scope.currentEditId) || position == -1) {
                return;
            }

            $http.delete('/api/parties/delete/' + $scope.currentEditId).then(function () {
                addNewAlert("success", "The " + name + " party was permanently deleted!", "delete");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "delete");
            })
        };
    }]);