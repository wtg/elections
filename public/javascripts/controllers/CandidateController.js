app.controller('CandidateController', ['$scope', '$route', '$routeParams', '$showdown', '$sce', '$http', '$q', '$location', '$filter',
    function ($scope, $route, $routeParams, $showdown, $sce, $http, $q, $location, $filter) {
        var loadData = function () {
            $scope.candidate = {};
            $scope.newAMA = {};
            $scope.amaFilter = 0;
            $scope.parties = [];
            $scope.dataLoaded = false;
            $scope.showAnswer = {};
            $q.all([
                $http.get('/api/candidates/rcs/' + $routeParams.rcs),
                $http.get('/api/parties/'),
                $http.get('/api/nominations/counts', {params: {rcs: $routeParams.rcs}}),
                $http.get('/api/assistants/candidate/' + $routeParams.rcs),
                $http.get('/api/ama/candidate/' + $routeParams.rcs)
            ]).then(function (responses) {
                if (!responses[0].data[0]) {
                    $location.url("/offices");
                    return;
                }

                $scope.candidate = responses[0].data[0];
                $scope.candidate.offices = [
                    {
                        office_id: $scope.candidate.office_id,
                        office_name: $scope.candidate.office_name,
                        nominations: $scope.candidate.nominations,
                        nominations_capped: 0,
                        overridden: $scope.candidate.nominations > 0,
                        office_nominations_required: $scope.candidate.office_nominations_required
                    }
                ];

                for (var i = 1; i < responses[0].data.length; i++) {
                    $scope.candidate.office_name += (i === responses[0].data.length - 1 ? ((i > 1 ? "," : "") + " and ") : ", ") +
                        " " + responses[0].data[i].office_name;
                    $scope.candidate.offices.push({
                        office_id: responses[0].data[i].office_id,
                        office_name: responses[0].data[i].office_name,
                        nominations: responses[0].data[i].nominations,
                        overridden: responses[0].data[i].nominations > 0,
                        office_nominations_required: responses[0].data[i].office_nominations_required,
                        nominations_capped: 0
                    });
                }

                if ($location.path().split('/')[$location.path().split('/').length - 1] === 'edit' &&
                    (!$scope.editPermissions && $scope.username !== $scope.candidate.rcs_id)) {
                    $location.url('/candidate/' + $routeParams.rcs);
                    return;
                }

                if ($scope.candidate.video_url) {
                    $scope.candidate.video_url_trusted = $sce.trustAsResourceUrl($scope.candidate.video_url);
                }

                if ($scope.candidate.major) {
                    var majors = $scope.candidate.major.split(';');
                    if (majors.length > 1) {
                        $scope.candidate.majors = majors;
                    }
                }

                $scope.parties = responses[1].data;
                $scope.parties.push({party_id: null, name: "Unaffiliated"});

                responses[2].data.forEach(function (n_elem) {
                    $scope.candidate.offices.forEach(function (o_elem) {
                        if(n_elem.office_id === o_elem.office_id && !o_elem.overridden) {
                            o_elem.nominations = n_elem.nominations;

                            // cap displayed nominations count at the nomination threshold
                            if (n_elem.nominations > o_elem.office_nominations_required) {
                                o_elem.nominations_capped = o_elem.office_nominations_required;
                            } else {
                                o_elem.nominations_capped = n_elem.nominations;
                            }
                        }
                    });
                });

                $scope.assistants = responses[3].data;

                $scope.ama = responses[4].data;
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();

        $scope.shouldAppendParty = function () {
            return $scope.candidate.party_name.split(' ')[$scope.candidate.party_name.split(' ').length - 1].toLowerCase() !== "party";
        };

        $scope.formName = function (person) {
            if(!person) person = $scope.candidate;
            return (person.preferred_name ? person.preferred_name : person.first_name) + " " + person.last_name;
        };

        $scope.currentSection = $routeParams.section === undefined ? "about" : $routeParams.section;

        $scope.changeSection = function (newSection) {
            $scope.currentSection = newSection;
        };

        $scope.convertMarkdown = function (string) {
            return $showdown.makeHtml(string);
        };

        $scope.saveChanges = function () {
            if (!$scope.editPermissions && $scope.candidate.rcs_id !== $scope.username) {
                return;
            }

            $scope.candidate.misc_info += "\nExperience: " + $scope.candidate.experience +
                "\nActivities: " + $scope.candidate.activities +
                "\nFacebook: " + $scope.candidate.facebook.replace("https://", "") +
                "\nTwitter: " + $scope.candidate.twitter.replace("https://", "");

            $http.put('/api/candidates/update/' + $routeParams.rcs, $scope.candidate).then(function () {
                $location.url('/candidate/' + $routeParams.rcs);
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            })
        };

        $scope.deleteCandidate = function (officeId) {
            var confirm_message = "Are you sure you want to permanently " +
                ($scope.candidate.offices.length === 1 ? "delete this candidate?" :
                    "remove this candidate's candidacy for the selected office?");

            if ((!$scope.editPermissions && $scope.candidate.rcs_id !== $scope.username) || !confirm(confirm_message)) {
                return;
            }

            $http.delete('/api/candidates/delete/' + $routeParams.rcs + '/' + officeId).then(function () {
                $location.url('/offices');
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            });
        };

        $scope.profileCSS = function () {
            return 'url(\'' + ($scope.candidate.profile_url ? $scope.candidate.profile_url : 'silhouette.png') + '\')';
        };

        $scope.coverCSS = function () {
            return 'url(\'' + ($scope.candidate.cover_url ? $scope.candidate.cover_url : "") + '\')';
        };

        $scope.newAssistant = {};

        $scope.addAssistantKeypressEvent = function (keyEvent) {
            if (keyEvent.which === 13 && $scope.newAssistant.rcs) {
                $scope.addAssistant();
            }
        };

        $scope.addAssistant = function () {
            if (!$scope.newAssistant.rcs) {
                return;
            }

            $http.post('/api/assistants/create/' + $routeParams.rcs + '/' + $scope.newAssistant.rcs + '/').then(function () {
                $route.reload();
            }, function (response) {
                console.log(response);
            });
        };

        $scope.removeAssistant = function (rcsId) {
            if (confirm("Are you sure you want to remove " + rcsId + " as an assistant?")) {
                $http.delete('/api/assistants/delete/' + $routeParams.rcs + '/' + rcsId + '/').then(function () {
                    $route.reload();
                }, function (response) {
                    console.log(response);
                });
            }
        };

        $scope.getAMAs = function () {
            if($scope.amaFilter === 0) {
                var AMAs = $scope.ama
            } else if($scope.amaFilter === 1) {
                var AMAs = $filter('filter')($scope.ama, { answer_text: '!' });
            } else if($scope.amaFilter === 2) {
                var AMAs = $filter('filter')($scope.ama, { answer_text: '!!' });
            }

            return $filter('orderBy')(AMAs, '-timestamp');
        };

        $scope.setAMAFilter = function (index) {
            $scope.amaFilter = index;
            console.log($scope.amaFilter);
        };

        $scope.submitAMA = function () {
            if(!$scope.newAMA.question_text) return;
            $scope.newAMA.is_anonymous = $scope.newAMA.is_anonymous ? 1 : 0;

            $http.post('/api/ama/candidate/' + $routeParams.rcs, $scope.newAMA).then(function () {
                $route.reload();
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            })
        };

        $scope.answerAMA = function(ama) {
            ama.answer_text = ama.new_answer_text;

            $http.put('/api/ama/candidate/' + $routeParams.rcs, ama).then(function () {
                $route.reload();
            }, function () {
                alert("Oh no! We encountered an error. Please try again. If this persists, email webtech@union.rpi.edu.");
            })
        };

        $scope.isCandidateAssistant = function (rcs) {
          for (const asst of $scope.assistants) {
            if (asst.rcs_id === rcs) return true;
          }
          return false;
        }
    }]);
