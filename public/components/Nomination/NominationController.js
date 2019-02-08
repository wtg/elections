import app from '../../elections';

import nomination from './nomination.html';

app.controller('NominationController', ['$scope', '$routeParams', '$http', '$q', '$location', '$templateCache',
  function($scope, $routeParams, $http, $q, $location, $templateCache) {
    $templateCache.put('nomination.html', nomination);

    $scope.validate = function() {
      $http.get('/api/nominations/validate', {
        params: {
          candidate_rcs: $routeParams.rcs,
          office: $routeParams.office,
          rcs: $scope.nomination.rcs,
          rin: $scope.nomination.rin,
          id: $scope.nomination.id,
        }
      }).then(function(response) {
        $scope.validation = response.data.validation;
        $scope.nominator = response.data.nominator;
        $scope.office = response.data.office;
      }, function(response) {
        $scope.error = "Unable to get recommendation data.";
      }).finally(function() {
        $scope.dataLoaded = true;
      });
    };

    let loadData = function() {
      $scope.dataLoaded = false;
      $scope.validation = {};

      if ($scope.editPermissions) {
        $scope.validate();
      } else {
        $scope.dataLoaded = true;
      }
    };
    loadData();

    $scope.isValid = function() {
      return $scope.nomination.valid === true;
    };

    $scope.isInvalid = function() {
      return $scope.nomination.valid === false;
    };

    $scope.isPending = function() {
      return $scope.nomination.valid == null;
    };

    $scope.statusText = function() {
      if ($scope.nomination.valid === true) return "Valid";
      if ($scope.nomination.valid === false) return "Invalid";
      if ($scope.nomination.valid == null) return "Pending";
    };

    $scope.setStatus = function() {
      $scope.nomination.valid = status;
      $scope.putNomination();
    };

    $scope.toggleValid = function() {
      if ($scope.nomination.valid === true) {
        $scope.nomination.valid = null;
      } else if ($scope.nomination.valid === false || $scope.nomination.valid == null) {
        $scope.nomination.valid = true;
      }
      $scope.putNomination();
    };

    $scope.toggleInvalid = function() {
      if ($scope.nomination.valid === false) {
        $scope.nomination.valid = null;
      } else if ($scope.nomination.valid === true || $scope.nomination.valid == null) {
        $scope.nomination.valid = false;
      }
      $scope.putNomination();
    };

    $scope.putNomination = function(nom) {
      nom = nom || $scope.nomination;
      const toSubmit = {
        rin: parseInt(nom.rin),
        rcs: nom.rcs,
        number: nom.num,
        page: nom.page,
        valid: nom.valid,
        id: parseInt(nom.id),
      };
      $http.put('/api/nominations/', toSubmit, {
        params: {
          nomination: $scope.nomination.id
        }
      }).then(function(response) {
        // success
      }, function(response) {
        alert("Oh no! We've encountered an error. Please try again. If this persists, email webtech@union.lists.rpi.edu.");
      });
    }

    // injected by NominationPage
    this.setNomination = function(nomination) {
      this.nomination = nomination;
    };

    $scope.changeNomination = function() {
      $scope.putNomination($scope.nomination);
      $scope.validate();
    }
  }
]);
