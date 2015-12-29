app.controller('OfficesController', ['$scope', '$route', '$routeParams', '$location', '$filter', '$http', '$q', '$cookies',
    function ($scope, $route, $routeParams, $location, $filter, $http, $q, $cookies) {
        var EDIT_ID_COOKIE_LABEL = "officesEditId",
            ALERTS_COOKIE_LABEL  = "officeAlerts";

        /**
         * Function that's called immediately where the data needed for the view is loaded
         */
        var loadData = function () {
            $q.all([
                $http.get('/api/offices/election/1'),
                $http.get('/api/candidates'),
                $http.get('/api/offices/types')
            ]).then(function (responses) {
                responses[0].data.forEach(function (elem) {
                    $scope.offices.push({
                        id: elem.office_id,
                        title: elem.name,
                        description: elem.description,
                        showDesc: false,
                        disabled: elem.disabled == 1,
                        type: elem.type,
                        numberOpenings: elem.openings,
                        nominationsRequired: elem.nominations_required,
                        changesPending: false
                    });
                });

                $scope.currentEditId = $cookies.getObject(EDIT_ID_COOKIE_LABEL) ? $cookies.getObject(EDIT_ID_COOKIE_LABEL).val : $scope.offices[0].id;

                responses[1].data.forEach(function (c_elem) {
                    $scope.offices.forEach(function (o_elem) {
                        if (c_elem.office_id === o_elem.id) {
                            if (!o_elem.candidates) {
                                o_elem.candidates = [];
                            }

                            o_elem.candidates.push({
                                name: c_elem.first_name + " " + c_elem.last_name,
                                party: c_elem.party_id,
                                rcsId: c_elem.rcs_id,
                                major: c_elem.major,
                                nominations: c_elem.nominations,
                                newType: "", // Don't ask. it's a long story.
                                profileImage: "data:image/jpeg;base64,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"
                            });
                        }
                    });
                });

                $scope.offices.forEach(function(o) {
                    if(o.candidates) {
                        shuffle(o.candidates);
                    }
                });

                var filterOpt = [];

                responses[2].data.forEach(function (elem) {
                    filterOpt.push({
                        slug: elem.type,
                        label: elem.type[0].toUpperCase() + elem.type.substr(1)
                    });
                });

                $scope.filterOptions.push({
                    slug: 'all',
                    label: 'All offices'
                });

                $scope.filterOptions = $scope.filterOptions.concat($filter('orderBy')(filterOpt, "slug"));
            }, function (status, error) {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            }).finally(function() {
                $scope.dataLoaded = true;
            });
        };
        loadData();

        /**
         * Function that's called immediately where all variables are instantiated
         */
        var instantiateVariables = function () {
            $scope.offices = [];

            $scope.filterOptions = [];

            $scope.newCandidate = {
                rcs: ""
            };

            $scope.new = {
                title: '', description: '', nominationsRequired: '', numberOpenings: '', type: '', disabled: false
            };

            $scope.dataLoaded = false;
        };
        instantiateVariables();

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

        var shuffle = function (array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        };

        /**
         * Called by the 'close' button on any alert; removes it from the alert array
         * @param index
         */
        $scope.removeAlert = function (index) {
            $scope.alerts.splice(index, 1);
            $cookies.putObject(ALERTS_COOKIE_LABEL, {array: $scope.alerts}, {expires: new Date(new Date().getTime() + 300000)});
        };


        $scope.$on('$routeChangeStart', function () {
            if($scope.filter === 'edit') {
                $cookies.putObject(EDIT_ID_COOKIE_LABEL, { val: $scope.currentEditId });
            }
        });

        /**
         * Function that's called immediately to determine the filter selected
         */
        var determineFilter = function () {
            if ($routeParams.filter === undefined || $routeParams.filter === "all" ||
                ($routeParams.filter === 'edit' && !$scope.editPermissions)) {
                $scope.filter = "all";
                $location.url('/offices');
            } else {
                $scope.filter = $routeParams.filter;
            }
        };
        determineFilter();

        /**
         * Called when a user selects a filter
         * @param filter
         */
        $scope.setFilter = function (filter) {
            if (filter === undefined || filter === 'all') {
                $scope.filter = "all";
                $location.url('/offices');
                return;
            }

            $scope.filter = filter;
            $location.url('/offices/' + filter);
        };

        /**
         * Determines how many offices exist for a given filter
         * @param filter
         * @returns {*}
         */
        $scope.numOffices = function (filter) {
            if ($scope.offices == undefined) {
                return 0;
            } else if (filter === undefined || filter === 'all') {
                return $scope.offices.length;
            } else {
                return $filter('filter')($scope.offices, {type: filter, disabled: false}).length;
            }
        };

        /**
         * Determines the percentage of nominations earned; used to populate the loading bar
         * @param obtained
         * @param required
         * @returns {*}
         */
        $scope.nominationPercentage = function (obtained, required) {
            if (obtained > required) {
                return 100;
            } else if (obtained < 0) {
                return 0;
            } else if (required == 0) {
                if (obtained == 0) {
                    return 100;
                } else {
                    return 0;
                }
            }

            return Math.round((obtained / required) * 100) + '%';
        };

        /**
         * Sets the current edit id so that the corresponding office is displayed on the edit view
         * @param newId
         */
        $scope.setEditId = function (newId) {
            $scope.currentEditId = newId;
            $scope.newCandidate.rcs = "";
        };

        /**
         * Removes a candidate from a given office
         * @param rcsId
         * @param officeId
         */
        $scope.removeCandidate = function (rcsId, officeId) {
            var confirmation = confirm("Are you sure you want to remove " + rcsId + " from this office?");

            if (confirmation) {
                $scope.offices.forEach(function (o) {
                    var title;
                    var indexToRemove = -1;
                    if (o.id === officeId) {
                        title = o.title;
                        o.candidates.forEach(function (c, index) {
                            if (c.rcsId === rcsId) {
                                indexToRemove = index;
                            }
                        });
                    }
                    if (indexToRemove > -1) {
                        $http.delete('/api/candidates/delete/' + rcsId + '/' + officeId + '/').then(function () {
                            o.candidates.splice(indexToRemove, 1);
                            addNewAlert("success", rcsId + " was removed as a candidate for " + title + "!", "remove_candidate");
                        }, function (response) {
                            addNewAlert("error", response.statusText + " (code: " + response.status + ")", "remove_candidate");
                        });
                    }
                });
            }
        };

        $scope.addCandidateKeypressEvent = function(keyEvent) {
            if (keyEvent.which === 13 && $scope.newCandidate.rcs) {
                $scope.addCandidate();
            }
        };

        /**
         * Adds a new candidate to a given office
         */
        $scope.addCandidate = function () {
            if(!$scope.newCandidate.rcs) {
                return;
            }

            var title = $scope.offices[findOffice($scope.currentEditId)].title;

            $http.post('/api/candidates/create/' + $scope.newCandidate.rcs + '/' + $scope.currentEditId + '/').then(function () {
                addNewAlert("success", $scope.newCandidate.rcs + " was successfully added as a candidate for " + title + "!", "add_candidate");
                $scope.newCandidate.rcs = "";
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "add_candidate");
            });
        };

        /**
         * Creates a new office
         */
        $scope.createOffice = function () {
            var title = $scope.new.title;
            var preparedData = {
                name: $scope.new.title,
                description: $scope.new.description,
                nominations_required: $scope.new.nominationsRequired,
                openings: $scope.new.numberOpenings,
                type: $scope.new.type,
                disabled: $scope.new.disabled
            };

            if (!preparedData.name) {
                addNewAlert("error", "You didn't enter a title for the office!", "create");
                return;
            } else if (!preparedData.description) {
                addNewAlert("error", "You didn't enter a description for the office!", "create");
                return;
            } else if (!preparedData.nominations_required) {
                addNewAlert("error", "You didn't enter a required number of nominations for the office!", "create");
                return;
            } else if (!preparedData.openings) {
                addNewAlert("error", "You didn't enter a number of openings for the office!", "create");
                return;
            } else if (!preparedData.type) {
                addNewAlert("error", "You didn't select a category for the office!", "create");
                return;
            }

            $http.post('/api/offices/create', preparedData).then(function () {
                addNewAlert("success", "The new office, entitled " + title + ", was created successfully!", "create");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "create");
            });
        };

        /**
         * Finds an office's index in the office array based on the ID
         * @param id
         * @returns {number}
         */
        var findOffice = function (id) {
            var position = -1;

            $scope.offices.forEach(function (elem, index) {
                if (elem.id == id) {
                    position = index;
                }
            });

            return position;
        };

        /**
         * Saves any pending edits on the currently selected office
         */
        $scope.saveEdits = function () {
            var position = findOffice($scope.currentEditId);
            var title = $scope.offices[position].title;

            if (isNaN($scope.currentEditId) || position == -1) {
                return;
            }

            var preparedData = {
                name: $scope.offices[position].title,
                description: $scope.offices[position].description,
                nominations_required: $scope.offices[position].nominationsRequired,
                openings: $scope.offices[position].numberOpenings,
                type: $scope.offices[position].type === 'new' ? $scope.offices[position].newType
                                                              : $scope.offices[position].type
            };

            if (!preparedData.name) {
                addNewAlert("error", "You didn't enter a title for the office!", "update");
                return;
            } else if (!preparedData.description) {
                addNewAlert("error", "You didn't enter a description for the office!", "update");
                return;
            } else if (!preparedData.nominations_required) {
                addNewAlert("error", "You didn't enter a required number of nominations for the office!", "update");
                return;
            } else if (!preparedData.openings) {
                addNewAlert("error", "You didn't enter a number of openings for the office!", "update");
                return;
            } else if (!preparedData.type) {
                addNewAlert("error", "You didn't select a category for the office!", "update");
                return;
            }

            $http.put('/api/offices/update/' + $scope.currentEditId, preparedData).then(function () {
                addNewAlert("success", "The " + title + " office was successfully updated!", "update");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "update");
            })
        };

        /**
         * Deletes an office based on the given edit id
         */
        $scope.deleteOffice = function () {
            var position = findOffice($scope.currentEditId);
            var title = $scope.offices[position].title;

            if (!confirm("Are you sure you want to permanently delete this office?") ||
                isNaN($scope.currentEditId) || position == -1) {
                return;
            }

            $http.delete('/api/offices/delete/' + $scope.currentEditId).then(function () {
                addNewAlert("success", "The " + title + " office was permanently deleted!", "delete");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "delete");
            })
        };

        /**
         * Toggles whether or not an office is disabled
         * @param id
         */
        $scope.toggleDisabled = function (id) {
            var position = findOffice(id);
            var title = $scope.offices[position].title,
                newStatus = $scope.offices[position].disabled ? "enabled" : "disabled";

            $http.put('/api/offices/toggle/' + id).then(function () {
                addNewAlert("success", "The " + title + " office was successfully " + newStatus + "!", "toggle");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "toggle");
            });
        };
    }]);
