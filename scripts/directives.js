
    
var hiiDirectives = angular.module('hiiDirectives', []);

hiiDirectives.directive('dhisHeader', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/directives/dhis-header.html',
        controller: function() {
            this.home = function(){        
                window.location = '/dhis-web-dashboard-integration/index.action';
            };   
        },
        controllerAs: 'headerCtrl'
    };
});

hiiDirectives.directive('dhisLeftBar', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/directives/dhis-left-bar.html',
        controller: function($scope, $location, $route, $rootScope) {
            $scope.showOUWT = true;

            //if we are in the listpage, show OUWT
            $rootScope.$on("$routeChangeStart", function(args){
                if($location.path() == '/list') $scope.showOUWT = true;
                else $scope.showOUWT = false;
            });
        },
        controllerAs:'leftBarCtrl'
    };
});


