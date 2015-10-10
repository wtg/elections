var dependencies = [
    'ngRoute'
];

var app = angular.module('Elections', dependencies);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/home', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        }).
        otherwise({
            redirectTo: '/home'
        });
}]);