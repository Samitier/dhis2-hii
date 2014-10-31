(function() {
    
   var hiiDirectives = angular.module('hiiDirectives', [])

   hiiDirectives.directive('dhisHeader', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/dhis-header.html',
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
            templateUrl: 'templates/dhis-left-bar.html',
            controller: function($scope) {
                $scope.curPage = 0;
                this.setPage = function(page) {
                    $scope.curPage = page;
                };
            },
            controllerAs:'leftBarCtrl'
        };
    });

    hiiDirectives.directive('mainPage', function() {
        return {
            restrict : 'E',
            templateUrl: 'templates/main-page.html',
            controller: function() {
                this.tableContents = [
                    {orgunit :'Cumbana', name : 'Cumbana Urbanization', numBuildings : 19},
                    {orgunit : 'Inhambane', name : 'Hospital Provincial de Inhambane', numBuildings : 19}
                ];
            },
            controllerAs: 'tableCtrl'
        };

    });

    hiiDirectives.directive('settingsPage', function() {
        return {
            restrict : 'E',
            templateUrl: 'templates/settings.html',
            controller: function() {
            },
            controllerAs: 'settingsCtrl'
        };
    });

})();

