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
            controller: function($scope, $http) {
                var ctrl = this;
                $http.get('/api/programs.json').success(function(json){
                        for(var i=0; i<json.programs.length;++i) {
                            if(json.programs[i].name == 'Sanitary Complex Basic Info') ctrl.programId = json.programs[i].id;
                        }
                        $http.get('/api/trackedEntityInstances.json?ouMode=ALL&program='+ ctrl.programId).success(function(json2){
                            ctrl.tableHeaders = json2.headers;
                            ctrl.tableContents = json2.rows;
                        });
                });
                this.setBasicInfoPanel = function(attrs, val) {
                    $scope.detailData = [];
                    for(var i=5; i<attrs.length-1;++i) $scope.detailData.push({name:attrs[i].column, value: val[i]});
                    $scope.complexImage = val[attrs.length-1];
                    $scope.setTab(1);
                    $scope.setPage(2);
                };
                
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
            controller: function($scope) {
                this.buildings = ["Lorem", "ipsum" ,"dolor", "sit", "amet", "consectetur", "adipisicing elit", "sed", "do", "eiusmod"];
                $scope.tab =1;
                $scope.isTab = function(tab) {
                    return this.tab ==tab;
                };
                $scope.setTab = function(tab) {
                    this.tab = tab;
                };
            },
            controllerAs: 'detailCtrl'
        };
    });


})();

