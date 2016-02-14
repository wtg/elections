app.controller('EventsController', ['$scope', '$http', function ($scope, $http) {
    $scope.events = [];

    var loadData = function() {
        $scope.dataLoaded = false;
        $scope.events = [];

        $http.get('/api/events/').then(function(response) {
            $scope.events = response.data;
            //response.data.forEach(function(elem) {
            //    $scope.events.push({
            //        id: elem.event_id,
            //        title: elem.title,
            //        date: elem.date,
            //        start: elem.start,
            //        end: elem.end,
            //        location: elem.location,
            //        description: elem.description
            //    });
            //});

            console.log($scope.events);
        }).finally(function() {
            $scope.dataLoaded = true;
        });
    };
    loadData();
}]);
