app.controller('PartiesController', ['$scope', '$http', '$cookies', '$location', function ($scope, $http, $cookies, $location) {
    $scope.parties = [];

    var initialize = function () {
        if ($location.path().split('/')[$location.path().split('/').length-1] === 'edit' && !$scope.editPermissions) {
            $location.url('/parties');
        }
    };
    initialize();

    var loadData = function() {
        $http.get('/api/parties/withleader').then(function(response) {
            response.data.forEach(function(elem) {
                $scope.parties.push({
                    id: elem.party_id,
                    name: elem.name,
                    leader: elem.rcs_id,
                    platform: elem.platform
                });
            });

            $scope.currentEditId = $cookies.getObject("partiesEditId") ? $cookies.getObject("partiesEditId").val : $scope.parties[0].id;
        })
    };
    loadData();

    $scope.setEditId = function (newId) {
        $scope.currentEditId = newId;
    };
}]);