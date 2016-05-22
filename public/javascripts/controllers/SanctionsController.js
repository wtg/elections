app.controller('SanctionsController', ['$scope', '$http', '$cookies', '$location', '$route', '$routeParams', '$q',
    function ($scope, $http, $cookies, $location, $route, $routeParams, $q) {

        var loadData = function () {
            $scope.candidate = {};
            $scope.dataLoaded = false;
            $scope.sanctions = [];
            $scope.new = { description: "" };

            $q.all([
                $http.get('/api/candidates/rcs/' + $routeParams.rcs),
                $http.get('/api/sanctions/active/' + $routeParams.rcs)
            ]).then(function (responses) {
                var response = responses[0];

                // below candidate response code is duplicated from the nominations controller

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

                response = responses[1];
                console.log(response);

                response.data.forEach(function (elem) {
                    elem.date = new Date(elem.date);
                    $scope.sanctions.push(elem);
                });

            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();

        $scope.createSanction = function() {
          if (!$scope.new.description) return;
          var preparedData = {
              description: $scope.new.description
          };
          $http.post('/api/sanctions/create/active/' + $routeParams.rcs, preparedData).then(function () {
              //addNewAlert("success", "The new sanction was created successfully!", "create");
              $route.reload();
          }, function (response) {
              //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "create");
          });
        }

        $scope.deleteSanction = function (sanctionId) {
            if (!confirm("Are you sure you want to permanently delete this sanction (id: " + sanctionId + ")?") ||
                isNaN(sanctionId)) {
                return;
            }

            $http.delete('/api/sanctions/delete/' + sanctionId).then(function () {
                //addNewAlert("success", "The sanction with id " + sanctionId + " was permanently deleted!", "delete");
                $route.reload();
            }, function (response) {
                //addNewAlert("error", response.statusText + " (code: " + response.status + ")", "delete");
            })
        };

        $scope.formName = function () {
            return ($scope.candidate.preferred_name ? $scope.candidate.preferred_name : $scope.candidate.first_name) +
                " " + $scope.candidate.last_name;
        };

        $scope.backToCandidate = function () {
            if(!$scope.sanctionsPending
                || confirm("You're pressing done, but you have sanctions pending! Are you sure you want to leave this page?")) {
                $location.url('/candidate/' + $scope.candidate.rcs_id);
            }
        };

    }]);
