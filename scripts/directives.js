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
            controller: function($scope, $location, $route, $rootScope, $interval) {
                $scope.showOUWT = true;
                $scope.selectedOrgUnit = sessionStorage.ouSelected;
                
                //this interval will work as a $watch for the outside variable sessionStorage.ouSelected
                $interval(function() {
                        if(sessionStorage.ouSelected != $scope.selectedOrgUnit) {
                            $scope.selectedOrgUnit = sessionStorage.ouSelected;
                        }
                }, 400);

                //if we are in the listpage, show OUWT
                $rootScope.$on("$routeChangeStart", function(args){
                    if($location.path() == '/list') $scope.showOUWT = true;
                    else $scope.showOUWT = false;
                });
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
                this.showError = false;
                this.send = function() {
                    dhis2APIService.updateTEIInfo($scope.editForm.trackedEntityInstance,$scope.editForm).then(function(dat){
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
            controller: function($scope,dhis2APIService) {

                this.isBuildingSelected = false;
                $scope.buildingSelected =0;
                $scope.editForm = {};
                this.showError = false;

                this.selectBuilding = function(index){
                    this.isBuildingSelected = true;
                    $scope.buildingSelected = index;
                };

                this.addBuilding = function(){
                    dhis2APIService.getTrackedEntityId("Building").then(function(dat) {
                        $scope.buildingTEid = dat;
                        dhis2APIService.createTEI(dat, $scope.complexInfo.orgUnit);
                    });
                    this.isBuildingSelected = true;
                };

                
                this.send = function() {
                    dhis2APIService.updateTEIInfo($scope.editForm.trackedEntityInstance,$scope.editForm).then(function(dat){
                        if(dat) {
                            $scope.buildings[$scope.buildingSelected] = $scope.editForm;
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
                    if($scope.editing) angular.copy($scope.buildings[$scope.buildingSelected], $scope.editForm);
                };
            },
            controllerAs:'buildingsCtrl'
        };
    });

})();

