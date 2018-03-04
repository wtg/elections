import app from '../../elections';
import './offices-card.css';
import silhouette from './silhouette.png';

app.controller('OfficesController', ['$scope', '$route', '$routeParams', '$location', '$filter', '$http', '$q', '$cookies',
    function ($scope, $route, $routeParams, $location, $filter, $http, $q, $cookies) {
        var EDIT_ID_COOKIE_LABEL = "officesEditId",
            ALERTS_COOKIE_LABEL = "officeAlerts";

        /**
         * Function that's called immediately where the data needed for the view is loaded
         */
        var loadData = function () {
            $q.all([
                $http.get('/api/offices/election/active'),
                $http.get('/api/candidates'),
                $http.get('/api/offices/types'),
                $http.get('/api/nominations/counts')
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
                        changesPending: false,
                        flippedCandidates: new Set(),
                    });
                });

                $scope.currentEditId = $cookies.getObject(EDIT_ID_COOKIE_LABEL) ?
                    $cookies.getObject(EDIT_ID_COOKIE_LABEL).val : ($scope.offices[0] ? $scope.offices[0].id : 0);

                responses[1].data.forEach(function (c_elem) {
                    $scope.offices.forEach(function (o_elem) {
                        if (c_elem.office_id === o_elem.id) {
                            if (!o_elem.candidates) {
                                o_elem.candidates = [];
                            }

                            o_elem.candidates.push({
                                name: (c_elem.preferred_name ? c_elem.preferred_name : c_elem.first_name) + " " + c_elem.last_name,
                                party_id: c_elem.party_id,
                                party_name: c_elem.party_name,
                                rcsId: c_elem.rcs_id,
                                major: c_elem.major,
                                nominations: c_elem.nominations,
                                overridden: c_elem.nominations > 0,
                                experience: c_elem.experience,
                                activities: c_elem.activities,
                                facebook: c_elem.facebook,
                                twitter: c_elem.twitter,
                                newType: "", // Don't ask. it's a long story.
                                profile_url: c_elem.profile_url,
                                cover_url: c_elem.cover_url,
                                winner: c_elem.winner
                            });
                        }
                    });
                });

                $scope.offices.forEach(function (o) {
                    if (o.candidates) {
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

                responses[3].data.forEach(function (n_elem) {
                    $scope.offices.forEach(function (o_elem) {
                        if(n_elem.office_id === o_elem.id) {
                            o_elem.candidates.forEach(function (c_elem) {
                                if(n_elem.rcs_id === c_elem.rcsId && !c_elem.overridden) {
                                    c_elem.nominations = n_elem.nominations;

                                    // cap displayed nominations count at the nomination threshold
                                    if (c_elem.nominations > o_elem.nominationsRequired) {
                                        c_elem.nominations_capped = o_elem.nominationsRequired;
                                    } else {
                                        c_elem.nominations_capped = c_elem.nominations;
                                    }
                                }
                            });
                        }
                    });
                });
            }, function (status, error) {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            }).finally(function () {
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
            $cookies.putObject(ALERTS_COOKIE_LABEL, {array: $scope.alerts});
        };

        $scope.profileCSS = function (candidate) {
            return 'url(\'' + (candidate.profile_url ? candidate.profile_url : silhouette) + '\')';
        };

        $scope.wrappedName = function (rcsId, officeId) {
            if(!document.getElementById("name" + rcsId + officeId)) return false;
            return window.getComputedStyle(document.getElementById("name" + rcsId + officeId)).height > "28px";
        }

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
         * Sets the current edit id so that the corresponding office is displayed on the edit view
         * @param newId
         */
        $scope.setEditId = function (newId) {
            $scope.currentEditId = newId;
            $scope.newCandidate.rcs = "";
            $cookies.putObject(EDIT_ID_COOKIE_LABEL, {val: $scope.currentEditId});
        };

        $scope.$on('$routeChangeStart', function () {
            if ($scope.filter === 'edit') {
                $cookies.putObject(EDIT_ID_COOKIE_LABEL, {val: $scope.currentEditId});
            }
        });

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

         /**
         * Removes a candidate from a given office
         * @param rcsId
         * @param officeId
         */
        $scope.toggleWon = function (rcsId, officeId) {
            var confirmation = confirm("Are you sure you want to toggle win status for " + rcsId + "?");

            if (confirmation) {
                $scope.offices.forEach(function (o) {
                    var title;
                    var indexToToggle = -1;
                    if (o.id === officeId) {
                        title = o.title;
                        o.candidates.forEach(function (c, index) {
                            if (c.rcsId === rcsId) {
                                indexToToggle = index;
                            }
                        });
                    }
                    if (indexToToggle > -1) {
                        var status;
                        if (o.candidates[indexToToggle].winner) status = '0';
                        else status = '1';
                        $http.put('/api/candidates/update/' + rcsId + '/' + officeId + '/' + status).then(function () {
                            addNewAlert("success", rcsId + " had win status toggled", "toggle_candidate_win");
                        }, function (response) {
                            addNewAlert("error", response.statusText + " (code: " + response.status + ")", "toggle_candidate_win");
                        });
                    }
                });
            }
        };

        $scope.addCandidateKeypressEvent = function (keyEvent) {
            if (keyEvent.which === 13 && $scope.newCandidate.rcs) {
                $scope.addCandidate();
            }
        };

        /**
         * Adds a new candidate to a given office
         */
        $scope.addCandidate = function () {
            if (!$scope.newCandidate.rcs) {
                return;
            }

            var title = $scope.offices[findOffice($scope.currentEditId)].title;

            $http.post('/api/candidates/create/' + $scope.newCandidate.rcs + '/' + $scope.currentEditId + '/').then(function () {
                addNewAlert("success", $scope.newCandidate.rcs + " was successfully added as a candidate for " + title + "!", "add_candidate");
                $scope.newCandidate.rcs = "";
                $route.reload();
            }, function (response) {
                console.log(response);
                addNewAlert("error", (response.data ? response.data : response.statusText) +
                    " (code: " + response.status + ")", "add_candidate");
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
            } else if (!preparedData.nominations_required && preparedData.nominations_required !== 0 &&
                        preparedData.nominations_required !== "0") {
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

        // flip candidate cards
        $scope.flip = function (candidate, office) {
          if (office.flippedCandidates.has(candidate)) {
            office.flippedCandidates.delete(candidate);
          } else {
            office.flippedCandidates.add(candidate);
          }
        }

        $scope.flipped = function (candidate, office) {
          return office.flippedCandidates.has(candidate);
        }
    }]);
