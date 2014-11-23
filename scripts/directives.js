(function() {
    
   var hiiDirectives = angular.module('hiiDirectives', []);

   hiiDirectives.directive('dhisHeader', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/dhis-header.html',
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
            templateUrl: 'views/dhis-left-bar.html',
            controller: function($scope) {
                $scope.showOUWT = true;
                $scope.showOrgUnitTree = function(show) {
                    $scope.showOUWT = show;
                };
            },
            controllerAs:'leftBarCtrl'
        };
    });

    hiiDirectives.directive('basicInfoTab', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/basic-info-tab.html',
            controller: function($scope, dhis2APIService) {
                
                $scope.editForm = {};
                $scope.editing=false;
                this.showError = false;
                
                this.send = function() {
                    dhis2APIService.updateComplexInfo($scope.complexId,$scope.editForm).then(function(dat){
                        if(dat) {
                            $scope.complexInfo = $scope.editForm;
                            $scope.editing = false;
                        }
                        else this.showError= true; //currently not showing error
                    });
                };

                this.isEditing = function() {
                    return $scope.editing;
                };

                this.setEditing = function(edit){
                    $scope.editing = edit;
                    showError = false;
                    $scope.editForm={};
                    if($scope.editing) angular.copy($scope.complexInfo, $scope.editForm);
                };
            },
            controllerAs:'basicInfoCtrl'
        };
    });

    hiiDirectives.directive('reportTab', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/report-tab.html',
            controller: function($scope) {
            },
            controllerAs:'reportCtrl'
        };
    });

    hiiDirectives.directive('buildingsTab', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/buildings-tab.html',
            controller: function($scope) {
            },
            controllerAs:'buildingsTab'
        };
    });

})();

