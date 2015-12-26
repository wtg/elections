app.controller('PartiesListController', ['$scope', '$http', function ($scope, $http) {
    $scope.parties = [];

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
            console.log($scope.parties);
        })
    };
    loadData();
}]);