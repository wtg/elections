app.controller('PartiesController', ['$scope', '$http', '$cookies', '$location', '$route',
    function ($scope, $http, $cookies, $location, $route) {
        var initialize = function () {
            $scope.parties = [];

            if ($location.path().split('/')[$location.path().split('/').length - 1] === 'edit' && !$scope.editPermissions) {
                $location.url('/parties');
            }
        };
        initialize();

        var loadData = function () {
            $http.get('/api/parties/withleader').then(function (response) {
                response.data.forEach(function (elem) {
                    $scope.parties.push({
                        id: elem.party_id,
                        name: elem.name,
                        leader: elem.rcs_id,
                        platform: elem.platform,
                        changesPending: false
                    });
                });

                $scope.currentEditId = $cookies.getObject("partiesEditId") ? $cookies.getObject("partiesEditId").val : $scope.parties[0].id;

                $scope.new = {
                    name: "",
                    platform: ""
                };
            })
        };
        loadData();

        $scope.setEditId = function (newId) {
            $scope.currentEditId = newId;
        };

        /**
         * Finds an party's index in the party array based on the ID
         * @param id
         * @returns {number}
         */
        var findParty = function (id) {
            var position = -1;

            $scope.parties.forEach(function (elem, index) {
                if (elem.id == id) {
                    position = index;
                }
            });

            return position;
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

            //if (!preparedData.name) {
            //    addNewAlert("error", "You didn't enter a title for the office!", "create");
            //    return;
            //} else if (!preparedData.description) {
            //    addNewAlert("error", "You didn't enter a description for the office!", "create");
            //    return;
            //}

            $http.post('/api/parties/create', preparedData).then(function () {
                //addNewAlert("success", "The new office, entitled " + name + ", was created successfully!", "create");
                alert('done');
                $route.reload();
            }, function (response) {
                //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "create");
            });
        };

        /**
         * Saves any pending edits on the currently selected office
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

            //if (!preparedData.name) {
            //    addNewAlert("error", "You didn't enter a title for the office!", "update");
            //    return;
            //} else if (!preparedData.description) {
            //    addNewAlert("error", "You didn't enter a description for the office!", "update");
            //    return;
            //}

            $http.put('/api/parties/update/' + $scope.currentEditId, preparedData).then(function () {
                //addNewAlert("success", "The " + title + " office was successfully updated!", "update");
                $route.reload();
            }, function (response) {
                //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "update");
            })
        };

        /**
         * Deletes an office based on the given edit id
         */
        $scope.deleteParty = function () {
            var position = findParty($scope.currentEditId);
            var name = $scope.parties[position].name;

            if (!confirm("Are you sure you want to permanently delete this office?") ||
                isNaN($scope.currentEditId) || position == -1) {
                return;
            }

            $http.delete('/api/parties/delete/' + $scope.currentEditId).then(function () {
                //addNewAlert("success", "The " + name + " office was permanently deleted!", "delete");
                alert("DONE WORKED");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "delete");
            })
        };
    }]);