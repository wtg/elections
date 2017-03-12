app.controller('ExpensesController', ['$scope', '$routeParams', '$http', '$q', '$location',
    function ($scope, $routeParams, $http, $q, $location) {
        $scope.expenses = [
            {
                expense_id: 1,
                item_name: 'test',
                store: 'test',
                item_price: 4.99,
                quantity: 10,
                total_price: 49.90
            }
        ];
        $scope.newExpense = {};
        $scope.totalBudget = 300;

        var loadData = function () {
            $scope.candidate = {};
            $scope.dataLoaded = false;
            $scope.nominationsPending = false;
            $scope.nominationsSubmitted = false;

            $http.get('/api/candidates/rcs/' + $routeParams.rcs).then(function (response) {
                if (!response.data[0]) {
                    $location.url("/offices");
                    return;
                }

                $scope.candidate = response.data[0];
                $scope.candidate.offices = [
                    {office_id: $scope.candidate.office_id, office_name: $scope.candidate.office_name}
                ];
                $scope.selectedOfficeId = $scope.candidate.office_id;

                for (var i = 1; i < response.data.length; i++) {
                    $scope.candidate.office_name += (i === response.data.length - 1 ? ((i > 1 ? "," : "") + " and ") : ", ") +
                        " " + response.data[i].office_name;
                    $scope.candidate.offices.push({
                        office_id: response.data[i].office_id,
                        office_name: response.data[i].office_name
                    });
                }

                if (!$scope.editPermissions) {
                    $location.url('/offices');
                }
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();

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
    }]);
