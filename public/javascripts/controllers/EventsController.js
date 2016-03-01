app.controller('EventsController', ['$scope', '$http', '$cookies', '$location', '$route', '$routeParams',
    function ($scope, $http, $cookies, $location, $route, $routeParams) {
        var EDIT_ID_COOKIE_LABEL = "eventsEditId",
            ALERTS_COOKIE_LABEL = "eventsAlerts";

        var initialize = function () {
            $scope.events = [];
            $scope.pastEvents = [];

            $scope.new = {
                title: "", location: "", date: null, start: null, end: null, description: ""
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
                response.data.forEach(function (elem) {
                    elem.date = new Date(elem.date);
                    elem.start_string = elem.start;
                    elem.start = new Date('Thu, 01 Jan 1970 ' + elem.start + ' GMT-0500');

                    if (elem.end) {
                        elem.end_string = elem.end;
                        elem.end = new Date('Thu, 01 Jan 1970 ' + elem.end + ' GMT-0500');
                    }

                    if(!$scope.isPastEvent(elem.date)) {
                        $scope.events.push(elem);
                    } /*else {
                        $scope.pastEvents.push(elem);
                    }*/
                });

                $scope.currentEditId = $cookies.getObject(EDIT_ID_COOKIE_LABEL) ?
                    $cookies.getObject(EDIT_ID_COOKIE_LABEL).val : ($scope.events[0] ? $scope.events[0].event_id : 0);
                console.log( $scope.currentEditId);
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
            if(newId !== "new") {
                $cookies.putObject(EDIT_ID_COOKIE_LABEL, {val: $scope.currentEditId});
            }
        };

        $scope.numEvents = function () {
          return $scope.events.length;
        }

        $scope.toggleBulkDelete = function () {
            if ($scope.bulkDelete) {
              $scope.bulkDelete = false;
            }
            else {
              $scope.bulkDelete = true;
            }
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

        /**
         * Creates a new event
         */
        $scope.createEvent = function () {
            var title = $scope.new.title;

            var preparedData = {
                title: $scope.new.title,
                location: $scope.new.location,
                date: "",
                start: "",
                end: "",
                description: $scope.new.description
            };

            if($scope.new.date) {
              preparedData.date = $scope.new.date.toISOString().substr(0,10);
            }

            if($scope.new.start) {
              preparedData.start = $scope.new.start.getHours() + ":" +
              $scope.new.start.getMinutes() + ":" + $scope.new.start.getSeconds();
            }

            if($scope.new.end) {
                preparedData.end = $scope.new.end.getHours() + ":" +
                $scope.new.end.getMinutes() + ":" + $scope.new.end.getSeconds();
            }

            if (!$scope.formFilled(preparedData, "create")) return;

            $http.post('/api/events/create', preparedData).then(function () {
                addNewAlert("success", "The new event, entitled " + title + ", was created successfully!", "create");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "create");
            });
        };

        /**
         * Saves any pending edits on the currently selected event
         */
        $scope.saveEdits = function () {
            var position = findEvent($scope.currentEditId);
            var title = $scope.events[position].title;

            if (isNaN($scope.currentEditId) || position == -1) {
                return;
            }

            var preparedData = {
                title: $scope.events[position].title,
                location: $scope.events[position].location,
                date: "",
                start: "",
                end: "",
                description: $scope.events[position].description
            };

            if($scope.events[position].date) {
              preparedData.date = $scope.events[position].date.toISOString().substr(0,10);
            }

            if($scope.events[position].start) {
              preparedData.start = $scope.events[position].start.getHours() + ":" +
              $scope.events[position].start.getMinutes() + ":" + $scope.events[position].start.getSeconds();
            }

            if($scope.events[position].end) {
                preparedData.end = $scope.events[position].end.getHours() + ":" +
                $scope.events[position].end.getMinutes() + ":" + $scope.events[position].end.getSeconds();
            }

            if (!$scope.formFilled(preparedData, "update")) return;

            $http.put('/api/events/update/' + $scope.currentEditId, preparedData).then(function () {
                addNewAlert("success", "The event entitled " + title + " was successfully updated!", "update");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "update");
            })
        };

        $scope.formFilled = function (preparedData, from) {
            var failedFields = []
            for(var i in preparedData) {
                if(preparedData.hasOwnProperty(i) && !preparedData[i]) {
                    if(i !== "description" || (!failedFields.length &&
                        !confirm("Are you sure you want this event to have no " +
                        "description? It's better to have one! Click OK to proceed "+
                        "anyway."))) {
                        failedFields.push(i);
                    }
                }
            }
            var fieldlist = "";
            for (var i in failedFields) {
              fieldlist += failedFields[i];
              if (i < failedFields.length - 1) {
                fieldlist += ", ";
              }
            }
            if (failedFields.length) {
                addNewAlert("error", "You didn't enter the following for your event: " + fieldlist, from);
            }
            return !failedFields.length;
        }

        /**
         * Deletes an event based on the given edit id
         */
        $scope.deleteEvent = function (eventIndex, bulk) {
            var position = findEvent(eventIndex);
            var title = $scope.events[position].title;

            if (!confirm("Are you sure you want to permanently delete this event? \"" + title + "\" will not be recoverable!") ||
                isNaN(eventIndex) || position == -1) {
                return;
            }

            $http.delete('/api/events/delete/' + eventIndex).then(function () {
                addNewAlert("success", "The event entitled " + title + " was permanently deleted!", "delete");
                if (!bulk || !$scope.numEvents()) $route.reload();
                else $scope.events.splice(position, 1);
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "delete");
            })
        };
    }]);
