app.controller('NominationsController', ['$scope', '$routeParams', '$http', '$q', '$location',
    function ($scope, $routeParams, $http, $q, $location) {
        var loadData = function () {
            $scope.candidate = {};
            $scope.dataLoaded = false;
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

                for (var i = 1; i < response.data.length; i++) {
                    $scope.candidate.office_name += (i === response.data.length - 1 ? ((i > 1 ? "," : "") + " and ") : ", ") +
                        " " + response.data[i].office_name;
                    $scope.candidate.offices.push({
                        office_id: response.data[i].office_id,
                        office_name: response.data[i].office_name
                    });
                }

                if ($location.path().split('/')[$location.path().split('/').length - 1] === 'edit' &&
                    !$scope.editPermissions) {
                    $location.url('/offices');
                    return;
                }
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();


        var constructNominationTemplate = function() {
            $scope.nominations = [];
            for(var i = 0; i < 25; i++) {
                $scope.nominations.push({
                    rin: "",
                    initials: "",
                    status: -1
                });
            }
        };
        constructNominationTemplate();

        $scope.formName = function () {
            return ($scope.candidate.preferred_name ? $scope.candidate.preferred_name : $scope.candidate.first_name) +
                " " + $scope.candidate.last_name;
        };
    }]);