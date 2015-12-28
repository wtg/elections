app.controller('EventsController', ['$scope', '$http', function ($scope, $http) {
    $scope.events = [];

    var loadData = function() {
        $http.get('/api/events/').then(function(response) {
            response.data.forEach(function(elem) {
                $scope.events.push({
                    id: elem.event_id,
                    title: elem.title,
                    date: elem.date,
                    start: elem.start,
                    end: elem.end,
                    location: elem.location,
                    description: elem.description
                });
            });
            console.log($scope.events);
        });
    };
    loadData();
}]);