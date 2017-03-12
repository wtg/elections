app.controller('ExpensesController', ['$scope', '$routeParams', '$http', '$q', '$location', '$route', '$cookies',
    function ($scope, $routeParams, $http, $q, $location, $route, $cookies) {
        var ALERTS_COOKIE_LABEL = "expenseAlert";

        $scope.expenses = [];
        $scope.newExpense = {};
        $scope.totalBudget = 300;

        var loadData = function () {
            $scope.candidate = {};
            $scope.dataLoaded = false;
            $scope.nominationsPending = false;
            $scope.nominationsSubmitted = false;

            $q.all([
                $http.get('/api/candidates/rcs/' + $routeParams.rcs),
                $http.get('/api/expenses/candidate/' + $routeParams.rcs),
            ]).then(function (responses) {
                if (!responses[0].data[0]) {
                    $location.url("/offices");
                    return;
                }

                $scope.candidate = responses[0].data[0];
                $scope.candidate.offices = [
                    {office_id: $scope.candidate.office_id, office_name: $scope.candidate.office_name}
                ];
                $scope.selectedOfficeId = $scope.candidate.office_id;

                for (var i = 1; i < responses[0].data.length; i++) {
                    $scope.candidate.office_name += (i === responses[0].data.length - 1 ? ((i > 1 ? "," : "") + " and ") : ", ") +
                        " " + responses[0].data[i].office_name;
                    $scope.candidate.offices.push({
                        office_id: responses[0].data[i].office_id,
                        office_name: responses[0].data[i].office_name
                    });
                }

                if (!$scope.editPermissions && $scope.candidate != $scope.username) {
                    $location.url('/offices');
                }

                $scope.expenses = responses[1].data;
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();

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

        var findExpense = function (id) {
            var position = -1;

            $scope.expenses.forEach(function (elem, index) {
                if (elem.expense_id == id) {
                    position = index;
                }
            });

            return position;
        };

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

        $scope.removeAlert = function (index) {
            $scope.alerts.splice(index, 1);
            $cookies.putObject(ALERTS_COOKIE_LABEL, {array: $scope.alerts});
        };

        $scope.backToCandidate = function () {
            if(!$scope.nominationsPending
                || confirm("You're pressing done, but you have nominations pending! Are you sure you want to leave this page?")) {
                $location.url('/candidate/' + $scope.candidate.rcs_id);
            }
        };

        $scope.formName = function () {
            return ($scope.candidate.preferred_name ? $scope.candidate.preferred_name : $scope.candidate.first_name) +
                " " + $scope.candidate.last_name;
        };

        $scope.calculateNewExpenseTotalPrice = function() {
            if(!$scope.newExpense || !$scope.newExpense.quantity || !$scope.newExpense.item_price) {
                return 0;
            }

            return $scope.newExpense.quantity * $scope.newExpense.item_price;
        }

        $scope.calculateTotalSpent = function () {
            var total = 0;
            for(var i = 0; i < $scope.expenses.length; i++) {
                total += $scope.expenses[i].total_price;
            }
            return total;
        };

        $scope.calculateRemainingBudget = function () {
            return $scope.totalBudget - $scope.calculateTotalSpent();
        };

        $scope.deleteExpense = function (expenseId) {
            var position = findExpense(expenseId);
            var title = $scope.expenses[position].item_name;

            if (isNaN(expenseId) || position == -1 ||
                !confirm("Are you sure you want to permanently delete this expense? \"" + title + "\" will not be recoverable!")) {
                return;
            }

            $http.delete('/api/expenses/delete/' + expenseId).then(function () {
                addNewAlert("success", "The expense entitled " + title + " was permanently deleted!", "delete");
                $route.reload();
            }, function (response) {
                addNewAlert("error", response.statusText + " (code: " + response.status + ")", "delete");
            })
        };
    }]);
