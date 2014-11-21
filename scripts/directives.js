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
            controller: function($scope,$translate, dhis2APIService) {
                dhis2APIService.getProgramId('Sanitary Complex Basic Info').then(function(data) {
                    $scope.complexProgramID = data;
                    dhis2APIService.getTrackedEntitiesByProgram($scope.complexProgramID).then(function(dat){
                        $scope.complexData = dat;
                    })
                });
                dhis2APIService.getUserUiLocale().then(function(dat){
                    var locale = dat;
                    $translate.uses(locale);
                });
                this.setBasicInfoPanel = function(index) {
                    $scope.indexComplex = index;
                    $scope.complexDataForm = [];
                    //$scope.selectedComplexInfo = {id:val[0], orgunit:val[3], trackedEntity:val[4]}; //la tracked entiy hauria de ser un valor global al inicialitzar
                    /*for(var i=5; i<$scope.complexData.tableHeaders.length;++i) {
                        $scope.complexDataForm.push({id:$scope.complexData.tableHeaders[i], 
                            value: $scope.complexData.tableContents[$scope.indexComplex][i]});
                    }
                    console.dir($scope.complexDataForm);*/
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
            controller: function($scope, dhis2APIService) {
                $scope.tab =1;
                this.editing=false;
                this.showError = false;
                this.inputInfo =[];
                this.send = function() {
                    var message = {trackedEntity: $scope.complexData.tableContents[$scope.indexComplex][4], 
                                   orgUnit: $scope.complexData.tableContents[$scope.indexComplex][3], 
                                   attributes: []};
                    for(var i=5; i< this.inputInfo.length; ++i) {
                        message.attributes.push({attribute:$scope.complexData.tableHeaders[i].name, value: this.inputInfo[i]});
                    }
                    console.dir(message);
                    dhis2APIService.updateComplexInfo($scope.complexData.tableContents[$scope.indexComplex][0],message).then(function(dat){
                        console.dir(dat);
                    });
                };
                this.isEditing = function() {
                    return this.editing;
                };
                this.setEditing = function(edit){
                    this.editing = edit;
                    showError = false;
                    if(this.editing) for(var i=5; i<11;++i) this.inputInfo[i] = $scope.complexData.tableContents[$scope.indexComplex][i];
                };
                $scope.isTab = function(tab) {
                    return $scope.tab ==tab;
                };
                $scope.setTab = function(tab) {
                    $scope.tab = tab;
                };
            },
            controllerAs: 'detailCtrl'
        };
    });


})();

