app.controller('AddNominationsController', ['$scope', '$routeParams', '$http', '$q', '$location',
function ($scope, $routeParams, $http, $q, $location) {
  var loadData = function () {
    $scope.candidate = {};
    $scope.dataLoaded = false;
    $scope.office = {};
    $scope.nominations = [];

    $q.all([
      $http.get('/api/candidates/rcs/' + $routeParams.rcs)
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

      // set up nominations form
      for (let i = 0; i < 25; i++) {
        $scope.nominations.push({
          rin: null,
          initials: null,
          issues: new Set(),
          num: i + 1,
        });
      }
    }, function (response) {
      if (response.status === 401) {
        // this user isn't authorized to add nominations
        $location.url('/offices');
      } else {
        alert("Oh no! We've encountered an error. Please try again. If this persists, email webtech@union.lists.rpi.edu.");
      }
    }).finally(function () {
      $scope.dataLoaded = true;
    });
  };
  loadData();

  $scope.formName = function () {
    return ($scope.candidate.preferred_name ? $scope.candidate.preferred_name : $scope.candidate.first_name) +
    " " + $scope.candidate.last_name;
  };

  $scope.submit = function () {
    if (!$scope.canSubmit()) return;
    var nomsToSubmit = [];
    for (var i = 0; i < $scope.nominations.length; i++) {
      const nom = {
        rin: parseInt($scope.nominations[i].rin),
        initials: $scope.nominations[i].initials,
        number: $scope.nominations[i].num,
      }
      // if any one of the fields has data, submit it
      if (nom.rin || nom.initials) {
        nomsToSubmit.push(nom);
      }
    }

    $http.post('/api/nominations/', nomsToSubmit, {params: {
      rcs: $routeParams.rcs,
      office: $routeParams.office,
    }}).then(function (response) {
      $location.url('/candidate/' + $scope.candidate.rcs_id + '/nominations/' + $scope.office.office_id);
    });
  };

  $scope.backToNominations = function () {
    $location.url('/candidate/' + $scope.candidate.rcs_id + '/nominations/' + $scope.office.office_id);
  }

  $scope.changeNomination = function (nom) {
    const issues = [];

    // if row empty, no issues
    if (!nom.rin && !nom.initials) {
      nom.issues = issues;
      return;
    }

    if (nom.rin != null && nom.rin.length != 9) {
      issues.push("RIN must be nine characters.");
    }
    if (nom.initials != null && nom.initials.length > 3) {
      issues.push("Initials must be three characters or fewer.");
    }

    nom.issues = issues;
  }

  $scope.canSubmit = function () {
    let oneExists = false;
    for (const nom of $scope.nominations) {
      if (nom.issues.length > 0) return false;
      if (nom.rin || nom.initials) oneExists = true;
    }
    return oneExists;
  }

  $scope.colorNomination = function (nom) {
    let classes = {};
    for (const issue of nom.issues) {
      if (issue.indexOf("RIN") != -1) classes.rin = 'has-error';
      if (issue.indexOf("Initials") != -1) classes.initials = 'has-error';
    }
    return classes;
  };
}]);
