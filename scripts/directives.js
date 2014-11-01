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
                $scope.setPage = function(page) {
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
            controller: function($scope) {
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

    hiiDirectives.directive('detailPage', function() {
        return {
            restrict : 'E',
            templateUrl: 'templates/detail-page.html',
            controller: function() {
                this.info =[
                    {name:"Organization Unit:", value:"Lorem ipsum"}, 
                    {name: "Description:", value :"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor."}, 
                    {name: "Number of Buildings:", value :222}, 
                    {name: "Area:", value: 222}, 
                    {name: "Creation Date:", value : 222},  
                    {name: "Director Plan:", value :"yes"}];
                this.buildings = ["Lorem", "ipsum" ,"dolor", "sit", "amet", "consectetur", "adipisicing elit", "sed", "do", "eiusmod"];
                this.tab =1;
                this.isTab = function(tab) {
                    return this.tab ==tab;
                };
                this.setTab = function(tab) {
                    this.tab = tab;
                };
            },
            controllerAs: 'detailCtrl'
        };
    });


})();

