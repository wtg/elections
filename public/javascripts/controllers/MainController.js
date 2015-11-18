app.controller('MainController', ['$scope', '$location', function($scope,$location) {
	$scope.isCurrentPage = function(path) {
		return $location.path().split('/')[1] == path;
	}
	$scope.editPermissions = true;
}]);
