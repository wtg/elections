var dependencies = [
    'ngRoute', 'ng-showdown', 'ngCookies', 'yaru22.angular-timeago'
];

var app = angular.module('Elections', dependencies);

app.config(['$showdownProvider', function ($showdownProvider) {
    $showdownProvider.setOption('headerLevelStart', 3);
    $showdownProvider.setOption('simplifiedAutoLink', true);
}]);

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
    when('/candidate/:rcs/nominations', {
        templateUrl: 'partials/nominations.html',
        controller: 'NominationsController'
    }).
    when('/candidate/:rcs/sanctions', {
        templateUrl: 'partials/sanctions.html',
        controller: 'SanctionsController'
    }).
    when('/candidate/:rcs/:section', {
        templateUrl: 'partials/candidate.html',
        controller: 'CandidateController'
    }).
    when('/parties', {
        templateUrl: 'partials/partieslist.html',
        controller: 'PartiesController'
    }).
    when('/parties/edit', {
        templateUrl: 'partials/manageparties.html',
        controller: 'PartiesController'
    }).
    when('/party', {
        redirectTo: '/parties'
    }).
    when('/party/:detail_id', {
        templateUrl: 'partials/partydetails.html',
        controller: 'PartiesController'
    }).
    when('/events', {
        templateUrl: 'partials/events.html',
        controller: 'EventsController'
    }).
    when('/events/edit', {
        templateUrl: 'partials/manageevents.html',
        controller: 'EventsController'
    }).
    when('/settings', {
        templateUrl: 'partials/settings.html',
        controller: 'SettingsController'
    }).
    when('/:page', {
        templateUrl: 'partials/static.html',
        controller: 'StaticPageController'//,
        // resolve: {
        //     valid_statics: function() {
        //         var pages;
        //         angular.element.get('/api/static/listallpages', function (response) {
        //             pages = response;
        //         });
        //         return pages;
        //     }
        // }
    }).
    otherwise({
        redirectTo: '/home'
    });
}]);
