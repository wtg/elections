var dependencies = [
    'ngRoute'
];

var app = angular.module('Elections', dependencies);

app.config(['$routeProvider', function ($routeProvider) {
    var views = [
        "Home", "Offices"
    ];

    $routeProvider.
        when('/home', {
            templateUrl: 'partials/home.html',
            controller: 'HomeController'
        }).
        when('/offices', {
            templateUrl: 'partials/offices.html',
            controller: 'OfficesController'
        }).
        when('/candidate/:rcs', {
            templateUrl: 'partials/candidate.html',
            controller: 'CandidateController'
        }).
        otherwise({
            redirectTo: '/home'
        });
}]);