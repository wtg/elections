app.controller('MainController', ['$scope', '$location', '$http', function($scope, $location, $http) {
	$scope.isCurrentPage = function(path) {
		return $location.path().split('/')[1] == path;
	};

	$scope.editPermissions = false;
	$scope.authenticated = false;
	$scope.username = null;

	$http.get("/api/users/").then(function(response) {
		$scope.editPermissions = response.data.admin;
		$scope.authenticated = response.data.authenticated;
		$scope.username = response.data.username;
	});
}]);
