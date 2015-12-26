var dependencies = [
    'ngRoute', 'ng-showdown', 'ngCookies'
];

var app = angular.module('Elections', dependencies);

app.config(['$routeProvider', function ($routeProvider) {
    var views = [
        "Home", "Offices"
    ];

    $routeProvider.
        when('', {
            redirectTo: '/home'
        }).
        when('/home', {
            templateUrl: 'partials/home.html',
            controller: 'HomeController'
        }).
        when('/offices', {
            templateUrl: 'partials/offices.html',
            controller: 'OfficesController'
        }).
        when('/offices/:filter', {
            templateUrl: 'partials/offices.html',
            controller: 'OfficesController'
        }).
        when('/candidate', {
            redirectTo: '/offices'
        }).
        when('/candidate/:rcs', {
            templateUrl: 'partials/candidate.html',
            controller: 'CandidateController'
        }).
        when('/candidate/:rcs/edit', {
            templateUrl: 'partials/editcandidate.html',
            controller: 'CandidateController'
        }).
        when('/candidate/:rcs/:section', {
            templateUrl: 'partials/candidate.html',
            controller: 'CandidateController'
        }).
        when('/events', {
            templateUrl: 'partials/events.html',
            controller: 'EventsController'
        }).
        otherwise({
            redirectTo: '/home'
        });
}]);
