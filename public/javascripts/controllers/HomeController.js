app.controller('HomeController', ['$scope', '$sce', '$showdown', '$http', function ($scope, $sce, $showdown, $http) {
    $scope.reloadRandom = function () {
        $http.get('/api/candidates/random').then(function (response) {
            if (response.data[0] != undefined) {
                $scope.randomCandidate.name = response.data[0].first_name + " " + response.data[0].last_name;
                $scope.randomCandidate.position = response.data[0].name + " Candidate";
                $scope.randomCandidate.rcsId = response.data[0].rcs_id;
                $scope.randomCandidate.bio = response.data[0].about;

                if ($scope.randomCandidate.bio && $scope.randomCandidate.bio.length > 250) {
                    $scope.randomCandidate.bio = $scope.randomCandidate.bio.substr(0, 250) + "...";
                }

                $scope.randomCandidate.profile_url = response.data[0].profile_url ? response.data[0].profile_url : 'silhouette.png'
            }

            $scope.randomCandidate.loaded = true;
        }, function () {
            $scope.randomCandidate.loaded = true;
        });
    };

    var loadData = function () {
        $scope.events = [];
        $http.get('/api/events/limit/4').then(function (response) {
            response.data.forEach(function (elem) {
                $scope.events.push({
                    id: elem.event_id,
                    title: elem.title,
                    date: elem.date,
                    start: elem.start,
                    end: elem.end,
                    location: elem.location,
                    desc: elem.description
                });
            });
        });

        $scope.reloadRandom();
    };
    loadData();

    $scope.pageHeader = "GM Week Headquarters";
    $scope.slides = [
        {
            header: "Make your voice heard!",
            body: "During GM Week, student government goes up for election. Be sure to vote and help elect the next set of leaders."
        },
        {
            header: "Run for office!",
            body: "Are you interested in joining Student Government? Learn about becoming a candidate."
        },
        {
            header: "Partake in GM Week festivities!",
            body: "Events and activities will be going on throught the week."
        },
        {
            header: "Learn about the candidates!",
            body: "Meet the people, check out their platforms, and find the candidates that best match your views!"
        }
    ];

    $scope.infoBlocks = [
        {
            header: "Get out and vote",
            body: "Primary elections will take place on Monday, April 1. Final elections will take place on Thursday, April 1. " +
            "Get to Commons, the Union, or the DCC and earn a free GM Week mug by voting!",
            icon: "fa-check-square"
        },
        {
            header: "Take part in the fun",
            body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla pretium elementum. Ut " +
            "lobortis, nibh placerat iaculis feugiat, purus orci maximus nulla eget rutrum.",
            icon: "fa-smile-o"
        },
        {
            header: "Meet the candidates",
            body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla pretium elementum. Ut " +
            "lobortis, nibh placerat iaculis feugiat, purus orci maximus nulla eget rutrum.",
            icon: "fa-group"
        },
        {
            header: "Become a candidate",
            body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla pretium elementum. Ut " +
            "lobortis, nibh placerat iaculis feugiat, purus orci maximus nulla eget rutrum.",
            icon: "fa-plus-square"
        }
    ];

    $scope.electionTips = {
        header: "Election Rules and Tips",
        list: [
            "<b>Don't:</b> tear down posters, even if they appear to be in violation of an RnE regulation.<br/>" +
            "<b>Do:</b> report violations to RnE so they can take appropriate action. Email reports to <a href=\"mailto:rne@union.rpi.edu\">rne@union.rpi.edu</a>.",

            "<b>Don't:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.<br/>" +
            "<b>Do:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.",

            "<b>Don't:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.<br/>" +
            "<b>Do:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.",

            "<b>Don't:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.<br/>" +
            "<b>Do:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.",

            "<b>Don't:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.<br/>" +
            "<b>Do:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur commodo quam quis nulla.",
        ]
    };

    $scope.candidateHeader = "Meet a Candidate";

    $scope.randomCandidate = {
        name: "",
        position: "",
        bio: "",
        rcsId: "",
        loaded: false
    };

    $scope.eventHeader = "Upcoming Events";

    $scope.trust = function (str) {
        return $sce.trustAsHtml(str);
    };

    $scope.markdown = function (str) {
        return $showdown.makeHtml(str);
    };

    angular.element('.carousel').carousel({
        interval: 4000
    });
}]);