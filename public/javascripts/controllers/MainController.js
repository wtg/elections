app.controller('MainController', ['$scope', '$location', '$http', function ($scope, $location, $http) {
    $scope.isCurrentPage = function (path) {
        return $location.path().split('/')[1] == path;
    };

    $scope.editPermissions = false;
    $scope.authenticated = false;
    $scope.username = null;

    $http.get("/api/users/").then(function (response) {
        $scope.editPermissions = response.data.admin;
        $scope.authenticated = response.data.authenticated;
        $scope.username = response.data.username;
    });

    $scope.formatTime = function (time) {
        var components = time.split(":");
        if (parseInt(components[0]) > 12) {
            return (parseInt(components[0]) - 12) + ":" + components[1] + " PM";
        } else {
            return components[0] + ":" + components[1] + " AM";
        }
    };

    $scope.isPastEvent = function (date) {
        return date.toISOString().substr(0,10) < new Date().toISOString().substr(0,10);
    };
}]);
