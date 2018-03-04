import app from '../../elections';
// import './home.html';

app.controller('HomeController', ['$scope', '$sce', '$showdown', '$http', function ($scope, $sce, $showdown, $http) {
    $scope.reloadRandom = function () {

        if ($scope.randomCandidateList.length === 0) {
            return
        }

        if ($scope.randomCandidateIndex + 1 === $scope.randomCandidateList.length) {
            $scope.randomCandidateIndex = 0;
        } else {
            $scope.randomCandidateIndex += 1;
        }

        var rcs_id = $scope.randomCandidateList[$scope.randomCandidateIndex];

        $http.get('/api/candidates/rcs/' + rcs_id).then(function (response) {

            if (response.data !== undefined) {
                $scope.randomCandidate.name = (response.data[0].preferred_name ? response.data[0].preferred_name : response.data[0].first_name) + " " + response.data[0].last_name;

                // collect all offices for which the candidate is running
                var offices = [];
                $scope.randomCandidate.position = '';
                response.data.forEach(function (elem) {
                    offices.push(elem.office_name);
                });
                // turn it into a single string
                for (var i = 0; i < offices.length; i++) {
                    $scope.randomCandidate.position += offices[i];
                    if (i === 0 && offices.length === 2) {
                        $scope.randomCandidate.position += ' and ';
                    } else if (i === offices.length - 2 && offices.length > 2) {
                        $scope.randomCandidate.position += ', and ';
                    } else if (i !== offices.length - 1) {
                        $scope.randomCandidate.position += ', ';
                    }
                }
                $scope.randomCandidate.position += " candidate";

                $scope.randomCandidate.rcsId = response.data[0].rcs_id;
                $scope.randomCandidate.bio = response.data[0].about_stripped;

                if ($scope.randomCandidate.bio && $scope.randomCandidate.bio.length > 250) {
                    $scope.randomCandidate.bio = $scope.randomCandidate.bio.substr(0, 250) + "...";
                }

                $scope.randomCandidate.profile_url = response.data[0].profile_url;
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

        $scope.randomCandidateList = [];
        $scope.randomCandidateIndex = null;
        $http.get('/api/candidates/random_list').then(function (response) {
            response.data.forEach(function (elem) {
                $scope.randomCandidateList.push(elem.rcs_id);
            });
            $scope.reloadRandom();
        });
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
            body: "Primary elections will take place on Tuesday, April 3. Final elections will take place on Friday, April 6. " +
            "Get to Commons, the Union, or the DCC and earn a free GM Week mug by voting!",
            icon: "fa-check-square"
        },
        {
            header: "Take part in the fun",
            body: "Find out about upcoming elections related events, including the debates, election dates, and info sessions!",
            icon: "fa-smile-o"
        },
        {
            header: "Meet the candidates",
            body: "At the Annual Candidate Meat Up BBQ (Get it?)! Visit the Offices tab to find the candidates and their profiles.",
            icon: "fa-group"
        },
        {
            header: "Become a candidate",
            body: "You’ve got nothing better to do Wednesday night, right? Learn about how to become a candidate, read the handbook, " +
            "and find the forms needed to sign up!",
            icon: "fa-plus-square"
        }
    ];

    $scope.electionTips = {
        header: "Election Rules and Tips",
        list: [
            "<b>Don't:</b> Tear down posters, even if they appear to be in violation of an EC regulation.<br/>" +
            "<b>Do:</b> Report violations to the EC so they can take appropriate action. Email reports to <a href=\"mailto:union-elections@rpi.edu\">union-elections@rpi.edu</a>.",

            "<b>Don't:</b> Get only the exact amount of nominations required for an office.<br/>" +
            "<b>Do:</b> Get around 15% more than is required. Inevitably, some will be invalid.",

            "<b>Don't:</b> Actively campaign in dining halls or lecture halls during class hours.<br/>" +
            "<b>Do:</b> Check the elections handbook for acceptable campaigning locations. The definition of active campaigning, along with the campaign rules, are found in Section 5.",

            "<b>Don't:</b> Place posters on the sign boards on the footbridge.<br/>" +
            "<b>Do:</b> Check the elections handbook for postering rules.",

            "<b>Don't:</b> Have non-candidate assistants actively campaigning on your behalf.<br/>" +
            "<b>Do:</b> Register candidate assistants with the EC using the appropriate form."
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
