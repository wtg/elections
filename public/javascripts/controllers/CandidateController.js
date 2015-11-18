app.controller('CandidateController', ['$scope', '$routeParams', function($scope, $routeParams) {
    $scope.candidate = {
        rcsId: $routeParams.rcs
    };


	$scope.currentSection = $routeParams.section === undefined ? "about" : $routeParams.section;
	
	console.log($scope.currentSection);

	$scope.changeSection = function(newSection) {
		$scope.currentSection = newSection;
	}
}]);
