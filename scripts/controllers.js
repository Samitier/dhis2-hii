   var hiiControllers = angular.module('hiiControllers', []);

hiiControllers.controller('listController', function($scope, $location, $translate, dhis2APIService) {
	this.init = function() {
		$scope.showOrgUnitTree(true);

	    dhis2APIService.getProgramId('Sanitary Complex Basic Info').then(function(data) {
	        $scope.complexProgramID = data;
	        dhis2APIService.getTrackedEntitiesByProgram($scope.complexProgramID).then(function(dat){
	            $scope.complexList = dat;
	        })
	    });

	    dhis2APIService.getUserUiLocale().then(function(dat){
	        $translate.uses(dat);
	    });
	};

    this.setBasicInfoPanel = function(index) {
        $location.path('/detail/' + $scope.complexList.tableContents[index][0]);
    };      
});


hiiControllers.controller('detailController', function($scope, $routeParams, dhis2APIService) {
	this.init = function() {
	    $scope.complexId = $routeParams.complexId;
	    dhis2APIService.getTrackedEntityById($routeParams.complexId).then(function(dat){
	        $scope.complexInfo = dat;
	    }); 
		$scope.showOrgUnitTree(false);
	    this.tab =1;
	};
    this.isTab = function(tab) {
        return this.tab ==tab;
    };
    this.setTab = function(tab) {
        this.tab = tab;
    };
});


hiiControllers.controller('settingsController', function($scope){
	$scope.showOrgUnitTree(false);
});