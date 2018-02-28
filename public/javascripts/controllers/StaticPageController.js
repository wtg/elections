import app from '../module';

app.controller('StaticPageController', ['$scope', '$http', '$cookies', '$showdown', '$location', '$route',
    function ($scope, $http, $cookies, $showdown, $location, $route) {
        $scope.title = '';
        $scope.content = '';
        $scope.htmlContent = '';
        $scope.dataLoaded = false;
        $scope.page = $location.path().split('/').pop();
        $scope.edit = false;

        var loadData = function () {
            $http.get("/api/static/" + $scope.page).then(function (response) {
                if(response.data.length === 0) {
                    $location.path('/');
                }
                $scope.title = response.data[0].title;
                $scope.content = response.data[0].content;
                $scope.htmlContent = $showdown.makeHtml(response.data[0].content);
            }, function () {
                $location.path('/');
            }).finally(function () {
                $scope.dataLoaded = true;
            });
        };
        loadData();

        $scope.toggleEdit = function () {
            if(!$scope.editPermissions) {
                return;
            }

            $scope.edit = !$scope.edit;
        };

        $scope.save = function (title, content) {
            if(!$scope.editPermissions) {
                return;
            }

            var data = {
                title: title,
                content: content
            };
            $http.put('/api/static/' + $scope.page, data).then(function (response) {
                $route.reload();
            });
        }
    }]);
