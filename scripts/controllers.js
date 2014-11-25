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
		$scope.editing=false;
	    //getting sanitary complex info
	    dhis2APIService.getTrackedEntityById($routeParams.complexId).then(function(dat){
	        $scope.complexInfo = dat;
	        //getting buildings info
	        $scope.buildings = [];
	        if($scope.complexInfo.relationships != null) {
	        	for(var i=0;i<$scope.complexInfo.relationships.length;++i) {
	        		if($scope.complexInfo.relationships[i].displayName == "Buildings of Sanitary Complex") {
	        			dhis2APIService.getTrackedEntityById($scope.complexInfo.relationships[i].trackedEntityInstanceA).then(
	        				function(dat){
	        					$scope.buildings.push(dat);
	        				}
	        			);
	        		}
	        	}
	        }
	    }); 
		$scope.showOrgUnitTree(false);
	    this.tab =1;
	};
    this.isTab = function(tab) {
        return this.tab ==tab;
    };
    this.setTab = function(tab) {
        this.tab = tab;
        $scope.editing = false;
    };
});


hiiControllers.controller('settingsController', function($scope){
	$scope.showOrgUnitTree(false);
});