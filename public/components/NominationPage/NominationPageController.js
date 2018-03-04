import app from '../../elections';

app.controller('NominationPageController', ['$scope', '$routeParams', '$http', '$q', '$location',
function ($scope, $routeParams, $http, $q, $location) {
  var loadData = function () {
    $scope.candidate = {};
    $scope.dataLoaded = false;
    $scope.page = {};
    $scope.office = {};

    $q.all([
      $http.get('/api/candidates/rcs/' + $routeParams.rcs),
      $http.get('/api/nominations/', {params: {
        rcs: $routeParams.rcs,
        page: $routeParams.page,
        office: $routeParams.office
      }})
    ]).then(function (responses) {
      // candidate info
      if (!responses[0].data[0]) {
        $location.url("/offices");
        return;
      }

      $scope.candidate = responses[0].data[0];

      for (const office of responses[0].data) {
        if (office.office_id == $routeParams.office) {
          $scope.office = office;
          break;
        }
      }

      $scope.page = responses[1].data[0];

      for (const nom of $scope.page.nominations) {
        continue;
        $http.get('/api/nominations/validate', {params: {
          candidate_rcs: $routeParams.rcs,
          office: $routeParams.office,
          initials: nom.initials,
          rin: nom.rin,
          name: nom.name
        }}).then(function (response) {
          console.log(response.data);
        }, function (response) {
          console.log("Oh no! We've encountered an error. Please try again. If this persists, email webtech@union.lists.rpi.edu.");
        });
      }
    }, function (response) {
      if (response.status === 401) {
        // this user isn't authorized to view nominations
        $location.url('/offices');
      } else {
        alert("Oh no! We've encountered an error. Please try again. If this persists, email webtech@union.lists.rpi.edu.");
      }
    }).finally(function () {
      $scope.dataLoaded = true;
    });
  };
  loadData();

  $scope.backToNominations = function () {
    if(!$scope.nominationsPending
      || confirm("You're pressing done, but you have nominations pending! Are you sure you want to leave this page?")) {
        $location.url('/candidate/' + $scope.candidate.rcs_id + '/nominations/' + $scope.office.office_id);
      }
    };

    $scope.formName = function () {
      return ($scope.candidate.preferred_name ? $scope.candidate.preferred_name : $scope.candidate.first_name) +
      " " + $scope.candidate.last_name;
    };

    $scope.statusText = function (nomination) {
      if (nomination.valid == null) {
        return "Pending";
      }
      if (nomination.valid === true) {
        return "Valid";
      }
      if (!nomination.valid === false) {
        return "Invalid";
      }
    };

    $scope.statusCounts = function () {
      const counts = {valid: 0, invalid: 0, pending: 0};
      for (const nom of $scope.page.nominations) {
        if (nom.valid === true) counts.valid++;
        if (nom.valid === false) counts.invalid++;
        if (nom.valid == null) counts.pending++;
      }
      return counts;
    };
  }]);
