var archimusApp = angular.module('ArchimusApp', ['ngRoute', 'ArchimusAppControllers']);

archimusApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/group01', {
            templateUrl: 'partials/group01.html',
            controller: 'Group01Controller'
        }).
        when('/group02', {
            templateUrl: 'partials/group02.html',
            controller: 'Group02Controller'
        }).
        when('/group03', {
            templateUrl: 'partials/group03.html',
            controller: 'Group03Controller'
        }).
        when('/group04', {
            templateUrl: 'partials/group04.html',
            controller: 'Group04Controller'
        }).
        otherwise({
            redirectTo: '/group01'
        });
}]);