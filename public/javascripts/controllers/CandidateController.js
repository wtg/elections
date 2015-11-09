app.controller('CandidateController', ['$scope', '$routeParams', function($scope, $routeParams) {
    $scope.candidate = {
        rcsId: $routeParams.rcs
    };
    console.log($routeParams.rcs);
}]);