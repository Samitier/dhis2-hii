
    
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
            $scope.showOUWT = false;
            if($location.path() == '/list') $scope.showOUWT = true;
            //if we are in the listpage, show OUWT
            $rootScope.$on("$routeChangeStart", function(args){
                if($location.path() == '/list') $scope.showOUWT = true;
                else $scope.showOUWT = false;
            });
        },
        controllerAs:'leftBarCtrl'
    };
});

hiiDirectives.directive('detailsTitle', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/directives/details-title.html',
        controller: function($scope, $location) {
            this.goBack = function() {
                $location.path('/list');
            };
        },
        controllerAs:'detailsTitleCtrl'
    };
});

hiiDirectives.directive('dhisRightBar', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/directives/right-bar.html',
        controller: function($scope, $location, $filter) {
            $scope.showHelp = false;
            $scope.helpTitle = "";
            $scope.helpContent = "";

            $scope.showPageHelp = function() {
                if($location.path().indexOf('/list')!=-1) {
                    $scope.helpTitle  = $filter('translate')("list_help_title");
                    $scope.helpContent = $filter('translate')("list_help_content");
                }
                else if($location.path().indexOf('/settings')!=-1) {
                    $scope.helpTitle  = $filter('translate')("settings_help_title");
                    $scope.helpContent = $filter('translate')("settings_help_content");
                }
                else if($location.path().indexOf('/basicInfo')!=-1) {
                    $scope.helpTitle  = $filter('translate')("basic_info_help_title");
                    $scope.helpContent = $filter('translate')("basic_info_help_content");
                }
                else if($location.path().indexOf('/reports')!=-1) {
                    $scope.helpTitle  = $filter('translate')("reports_help_title");
                    $scope.helpContent = $filter('translate')("reports_help_content");
                }
                else if($location.path().indexOf('/buildings')!=-1) {
                    $scope.helpTitle  = $filter('translate')("buildings_help_title");
                    $scope.helpContent = $filter('translate')("buildings_help_content");
                }
                $scope.showHelp=true;
            };

            $scope.setHelp = function(title, content) {
                $scope.helpTitle  = title;
                $scope.helpContent = content;
                $scope.showHelp=true;
            };

            this.hide = function() {
                $scope.showHelp= false;
            };
        },
        controllerAs:'rightBarCtrl'
    };
});

hiiDirectives.directive('repeatDone', function() {
    return function(scope, element, attrs) {
        if (scope.$last) { // all are rendered
            scope.$eval(attrs.repeatDone);
        }
    }
});


