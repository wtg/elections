import app from './elections';

import './components/Main/MainController';
import './components/Nominations/NominationsController';
import './components/Home/HomeController';
import './components/Offices/OfficesController';
import './components/Candidate/CandidateController';
import './components/Events/EventsController';
import './components/Parties/PartiesController';
import './components/Nomination/NominationController';
import './components/Nominations/NominationsController';
import './components/AddNominations/AddNominationsController';
import './components/NominationPage/NominationPageController';
import './components/StaticPage/StaticPageController';
import './components/Settings/SettingsController';

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
        template: require('./components/Home/home.html'),
        controller: 'HomeController'
    }).
    when('/offices', {
        template: require('./components/Offices/offices.html'),
        controller: 'OfficesController'
    }).
    when('/offices/:filter', {
        templateUrl: require('./components/Offices/offices.html'),
        controller: 'OfficesController'
    }).
    when('/candidate', {
        redirectTo: '/offices'
    }).
    when('/candidate/:rcs', {
        template: require('./components/Candidate/candidate.html'),
        controller: 'CandidateController'
    }).
    when('/candidate/:rcs/edit', {
        template: require('./components/Candidate/editcandidate.html'),
        controller: 'CandidateController'
    }).
    when('/candidate/:rcs/nominations', {
        template: require('./components/Nominations/nominations.html'),
        controller: 'NominationsController'
    }).
    when('/candidate/:rcs/nominations/:office', {
        template: require('./components/Nominations/nominations.html'),
        controller: 'NominationsController'
    }).
    when('/candidate/:rcs/nominations/:office/add', {
        template: require('./components/AddNominations/addnominations.html'),
        controller: 'AddNominationsController'
    }).
    when('/candidate/:rcs/nominations/:office/:page', {
        template: require('./components/NominationPage/nominationpage.html'),
        controller: 'NominationPageController'
    }).
    when('/candidate/:rcs/:section', {
        template: require('./components/Candidate/candidate.html'),
        controller: 'CandidateController'
    }).
    when('/parties', {
        template: require('./components/Parties/partieslist.html'),
        controller: 'PartiesController'
    }).
    when('/parties/edit', {
        template: require('./components/Parties/manageparties.html'),
        controller: 'PartiesController'
    }).
    when('/party', {
        redirectTo: '/parties'
    }).
    when('/party/:detail_id', {
        template: require('./components/Parties/partydetails.html'),
        controller: 'PartiesController'
    }).
    when('/events', {
        template: require('./components/Events/events.html'),
        controller: 'EventsController'
    }).
    when('/events/edit', {
        template: require('./components/Events/manageevents.html'),
        controller: 'EventsController'
    }).
    when('/settings', {
        template: require('./components/Settings/settings.html'),
        controller: 'SettingsController'
    }).
    when('/:page', {
        template: require('./components/StaticPage/static.html'),
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
