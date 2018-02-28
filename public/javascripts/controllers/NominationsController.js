import app from '../module';

app.controller('NominationsController', ['$scope', '$routeParams', '$http', '$q', '$location',
    function ($scope, $routeParams, $http, $q, $location) {
        var loadData = function () {
            $scope.candidate = {};
            $scope.dataLoaded = false;
            $scope.nominationsPending = false;
            $scope.nominationsSubmitted = false;
            $scope.showSubmitNominations = true;
            $scope.showNominationPages = true;
            $scope.showAddNominations = false;
            $scope.nominationPages = [];

            $q.all([
                $http.get('/api/candidates/rcs/' + $routeParams.rcs),
                $http.get('/api/nominations/', {params: {rcs: $routeParams.rcs}})
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
                    nomination_pages: []
                }];

                for (var i = 1; i < responses[0].data.length; i++) {
                    $scope.candidate.office_name += (i === responses[0].data.length - 1 ? ((i > 1 ? "," : "") + " and ") : ", ") +
                        " " + responses[0].data[i].office_name;
                    $scope.candidate.offices.push({
                        office_id: responses[0].data[i].office_id,
                        office_name: responses[0].data[i].office_name,
                        nomination_pages: []
                    });
                }

                // add in existing nominations
                for (const page of responses[1].data) {
                    for (const office of $scope.candidate.offices) {
                        if (page.office_id == office.office_id) {
                            office.nomination_pages.push(page);
                        }
                    }
                }

                // check if we have an office ID to show
                $scope.changeSelectedOffice($routeParams.office || $scope.candidate.office_id);

                if (!$scope.editPermissions) {
                    $scope.showSubmitNominations = false;
                }
            }, function (response) {
                if (response.status === 401) {
                    // this user isn't authorized to view nominations
                    $location.url('/offices');
                } else {
                    alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
                }
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
            $scope.showAddNominations = false;

            // set nominationPages to selected office
            for (const office of $scope.candidate.offices) {
              if (office.office_id == newId) {
                $scope.nominationPages = office.nomination_pages;
                break;
              }
            }

            // TODO: loading one office's nominations shouldn't reload the whole page
            // (therefore requesting all the nominations from the server again)
            $location.url('/candidate/' + $scope.candidate.rcs_id + '/nominations/' + newId);
        };

        $scope.backToCandidate = function () {
          $location.url('/candidate/' + $scope.candidate.rcs_id);
        };

        $scope.showPage = function (pageNum) {
          $location.url(
            '/candidate/' +
            $scope.candidate.rcs_id +
            '/nominations/' +
            $scope.selectedOfficeId +
            '/' +
            pageNum);
        }

        $scope.toggleShowSubmitNominations = function () {
            $scope.showSubmitNominations = !$scope.showSubmitNominations;
        }

        $scope.addNominations = function () {
            $location.url(
              '/candidate/' +
              $scope.candidate.rcs_id +
              '/nominations/' +
              $scope.selectedOfficeId +
              '/add');
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

        $scope.range = function(num) {
          return new Array(num);
        }

        $scope.statusCounts = function () {
          const counts = {valid: 0, invalid: 0, pending: 0};
          for (const page of $scope.nominationPages) {
            for (const nom of page.nominations) {
              if (nom.valid === true) counts.valid++;
              if (nom.valid === false) counts.invalid++;
              if (nom.valid == null) counts.pending++;
            }
          }
          return counts;
        };

        $scope.numValid = function (noms) {
          let count = 0;
          for (const nom of noms) {
            if (nom.valid === true) count++;
          }
          return count;
        };
    }]);
