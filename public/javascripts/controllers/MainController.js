app.controller('MainController', ['$scope', '$location', function($scope,$location) {
	$scope.isCurrentPage = function(path) {
		console.log($location.path().split('/')[1]);
		return $location.path().split('/')[1] == path;
	}
}]);
