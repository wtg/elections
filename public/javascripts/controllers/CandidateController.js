app.controller('CandidateController', ['$scope', '$routeParams', '$showdown', '$sce', '$http', '$location',
    function ($scope, $routeParams, $showdown, $sce, $http, $location) {
        var loadData = function () {
            $scope.candidate = {};
            $scope.dataLoaded = false;
            $http.get('/api/candidates/rcs/' + $routeParams.rcs).then(function (response) {
                if (!response.data[0]) {
                    $location.path("/offices");
                    return;
                }

                $scope.candidate = response.data[0];
                if($scope.candidate.video_url) {
                    $scope.candidate.video_url = $sce.trustAsResourceUrl($scope.candidate.video_url);
                }
            }, function (status, error) {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();

        $scope.shouldAppendParty = function() {
            return $scope.candidate.party_name.split(' ')[$scope.candidate.party_name.split(' ').length-1].toLowerCase() !== "party";
        };

        $scope.formName = function() {
            return $scope.candidate.preferred_name ? $scope.candidate.preferred_name : $scope.candidate.first_name +
                " " + $scope.candidate.last_name;
        };

        $scope.currentSection = $routeParams.section === undefined ? "about" : $routeParams.section;

        $scope.changeSection = function (newSection) {
            $scope.currentSection = newSection;
        };

        $scope.convertMarkdown = function (string) {
            var md = $showdown.makeHtml(string);
            return md;
        };
    }]);
