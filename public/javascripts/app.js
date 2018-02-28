import app from './module';

import './controllers/NominationsController';
import './controllers/MainController';
import './controllers/HomeController';
import './controllers/OfficesController';
import './controllers/CandidateController';
import './controllers/EventsController';
import './controllers/PartiesController';
import './controllers/NominationController';
import './controllers/NominationsController';
import './controllers/AddNominationsController';
import './controllers/NominationPageController';
import './controllers/StaticPageController';
import './controllers/SettingsController';

app.config(['$showdownProvider', function ($showdownProvider) {
    $showdownProvider.setOption('headerLevelStart', 3);
    $showdownProvider.setOption('simplifiedAutoLink', true);
}]);

app.config(['$routeProvider', function ($routeProvider) {
    var views = [
        "Home", "Offices"
    ];

    $routeProvider.
    when('/', {
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
    when('/candidate/:rcs/nominations/:office', {
        templateUrl: 'partials/nominations.html',
        controller: 'NominationsController'
    }).
    when('/candidate/:rcs/nominations/:office/add', {
        templateUrl: 'partials/addnominations.html',
        controller: 'AddNominationsController'
    }).
    when('/candidate/:rcs/nominations/:office/:page', {
        templateUrl: 'partials/nominationpage.html',
        controller: 'NominationPageController'
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
        redirectTo: '/'
    });
}]);

app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('#');
}]);

app.run(['$http', '$window', '$rootScope', '$location', function ($http, $window, $rootScope, $location) {
    // Google Analytics
    $http.get("/api/settings/ga_id").then(function (response) {
        // if GA not configured, do nothing
        if (response.data.length < 1) {
            return;
        }
        $window.ga('create', response.data[0].value, 'auto');
        $rootScope.$on('$routeChangeSuccess', function (event) {
            $window.ga('send', 'pageview', {page: $location.path()});
        });
    });
}]);
