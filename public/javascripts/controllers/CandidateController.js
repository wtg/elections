app.controller('CandidateController', ['$scope', '$routeParams', '$showdown', '$sce', '$http', '$location',
    function ($scope, $routeParams, $showdown, $sce, $http, $location) {
        var loadData = function () {
            if ($location.path().split('/')[$location.path().split('/').length - 1] === 'edit' && !$scope.editPermissions) {
                $location.url('/offices');
            }

            $scope.candidate = {};
            $scope.dataLoaded = false;
            $http.get('/api/candidates/rcs/' + $routeParams.rcs).then(function (response) {
                console.log(response.data);
                if (!response.data[0]) {
                    $location.path("/offices");
                    return;
                }

                $scope.candidate = response.data[0];
                if ($scope.candidate.video_url) {
                    $scope.candidate.video_url_trusted = $sce.trustAsResourceUrl($scope.candidate.video_url);
                }

                if($scope.candidate.major) {
                    var majors = $scope.candidate.major.split(';');
                    if (majors.length > 1) {
                        $scope.candidate.majors = majors;
                    }
                }
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();

        $scope.shouldAppendParty = function () {
            return $scope.candidate.party_name.split(' ')[$scope.candidate.party_name.split(' ').length - 1].toLowerCase() !== "party";
        };

        $scope.formName = function () {
            return ($scope.candidate.preferred_name ? $scope.candidate.preferred_name : $scope.candidate.first_name) +
            " " + $scope.candidate.last_name;
        };

        $scope.currentSection = $routeParams.section === undefined ? "about" : $routeParams.section;

        $scope.changeSection = function (newSection) {
            $scope.currentSection = newSection;
        };

        $scope.convertMarkdown = function (string) {
            return $showdown.makeHtml(string);
        };

        $scope.saveChanges = function () {
            console.log("HERE");
            if (!$scope.editPermissions) {
                return;
            }

            $scope.candidate.misc_info += "\nExperience: " + $scope.candidate.experience +
                "\nActivities: " + $scope.candidate.activities;

            console.log($scope.candidate.misc_info);

            $http.put('/api/candidates/update/' + $routeParams.rcs, $scope.candidate).then(function (response) {
                $location.url('/candidate/' + $routeParams.rcs);
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            })
        };
    }]);
