app.controller('NominationsController', ['$scope', '$routeParams', '$http', '$q', '$location',
    function ($scope, $routeParams, $http, $q, $location) {
        var loadData = function () {
            $scope.candidate = {};
            $scope.dataLoaded = false;
            $scope.nominationsPending = false;
            $scope.nominationsSubmitted = false;
            $scope.showSubmitNominations = true;

            $q.all([
                $http.get('/api/candidates/rcs/' + $routeParams.rcs),
                $http.get('/api/nominations/' + $routeParams.rcs + '/all')
            ]).then(function (responses) {
                // candidate info
                if (!responses[0].data[0]) {
                    $location.url("/offices");
                    return;
                }

                $scope.candidate = responses[0].data[0];
                $scope.candidate.offices = [{
                    office_id: $scope.candidate.office_id,
                    office_name: $scope.candidate.office_name,
                    nominations: []
                }];
                $scope.selectedOfficeId = $scope.candidate.office_id;

                for (var i = 1; i < responses[0].data.length; i++) {
                    $scope.candidate.office_name += (i === responses[0].data.length - 1 ? ((i > 1 ? "," : "") + " and ") : ", ") +
                        " " + responses[0].data[i].office_name;
                    $scope.candidate.offices.push({
                        office_id: responses[0].data[i].office_id,
                        office_name: responses[0].data[i].office_name,
                        nominations: []
                    });
                }

                // add in existing nominations
                for (const nom of responses[1].data) {
                    for (const office of $scope.candidate.offices) {
                        if (nom.office_id == office.office_id) {
                            office.nominations.push({
                                nomination_rin: nom.nomination_rin,
                                date: nom.date
                            });
                        }
                    }
                }

                if (!$scope.editPermissions) {
                    $scope.showSubmitNominations = false;
                }
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();

        $scope.enableNominationsPending = function () {
            $scope.nominationsPending = true;
        };

        $scope.changeSelectedOffice = function (newId) {
            $scope.selectedOfficeId = newId;
            $scope.nominationsPending = false;
            $scope.nominationsSubmitted = false;
            constructNominationTemplate();
        };

        var constructNominationTemplate = function() {
            $scope.nominations = [];
            for(var i = 0; i < 25; i++) {
                $scope.nominations.push({
                    rin: "",
                    initials: ""
                });
            }
        };
        constructNominationTemplate();

        $scope.backToCandidate = function () {
            if(!$scope.nominationsPending
                || confirm("You're pressing done, but you have nominations pending! Are you sure you want to leave this page?")) {
                $location.url('/candidate/' + $scope.candidate.rcs_id);
            }
        };

        $scope.toggleShowSubmitNominations = function () {
            $scope.showSubmitNominations = !$scope.showSubmitNominations;
        }

        $scope.formName = function () {
            return ($scope.candidate.preferred_name ? $scope.candidate.preferred_name : $scope.candidate.first_name) +
                " " + $scope.candidate.last_name;
        };

        $scope.colorInputs = function (nomination) {
            return {
                'has-success': $scope.nominationsSubmitted && nomination.status === 'success',
                'has-warning': $scope.nominationsSubmitted && (nomination.status === 'wrongclass' || nomination.status === 'already'),
                'has-error': $scope.nominationsSubmitted && (nomination.status === 'invalid' || nomination.status === 'initials')
            };
        };

        $scope.submit = function () {
            var nomsToSubmit = [];
            for(var i = 0; i < $scope.nominations.length; i++) {
               nomsToSubmit.push({rin: $scope.nominations[i].rin, initials: $scope.nominations[i].initials});
            }

            $http.post('/api/nominations/' + $scope.selectedOfficeId + '/' + $routeParams.rcs, nomsToSubmit).then(function (response) {
                console.log(response.data);
                $scope.nominationsSubmitted = true;
                $scope.nominations = response.data;
            });
        };
    }]);
