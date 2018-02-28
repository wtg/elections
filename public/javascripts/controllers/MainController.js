import app from '../module';

app.controller('MainController', ['$scope', '$location', '$http', function ($scope, $location, $http) {
    $scope.isCurrentPage = function (path) {
        return $location.path().split('/')[1] == path;
    };

    $scope.editPermissions = false;
    $scope.authenticated = false;
    $scope.username = null;
    $scope.maintenanceMode = false;
    $scope.maintenanceMessage = "";
    $scope.partiesEnabled = true;

    $http.get("/api/users/").then(function (response) {
        $scope.editPermissions = response.data.admin;
        $scope.authenticated = response.data.authenticated;
        $scope.username = response.data.username;
    });
    $http.get("/api/settings/maintenance_mode").then(function (response) {
        $scope.maintenanceMode = response.data[0].value/1;
    });
    $http.get("/api/settings/maintenance_message").then(function (response) {
        $scope.maintenanceMessage = response.data[0].value;
        if (!$scope.maintenanceMessage) {
          $scope.maintenanceMessage = "The site is under maintenance. Check back soon!"
        }
    });
    $http.get("/api/settings/parties_enabled").then(function (response) {
        $scope.partiesEnabled = response.data[0].value/1;
    });

    $scope.formatTime = function (time) {
        var components = time.split(":");
        if (parseInt(components[0]) > 12) {
            return (parseInt(components[0]) - 12) + ":" + components[1] + " PM";
        } else {
            return parseInt(components[0]) + ":" + components[1] + " AM";
        }
    };

    $scope.isPastEvent = function (date) {
        return date.toISOString().substr(0,10) < new Date().toISOString().substr(0,10);
    };

    /**
     * Determines the percentage of nominations earned; used to populate the loading bar
     * @param obtained
     * @param required
     * @returns {*}
     */
    $scope.nominationPercentage = function (obtained, required) {
        if (obtained > required) {
            return 100 + '%';
        } else if (obtained < 0) {
            return 0 + '%';
        } else if (required == 0) {
            if (obtained == 0) {
                return 100 + '%';
            } else {
                return 0 + '%';
            }
        }

        return Math.round((obtained / required) * 100) + '%';
    };
}]);
