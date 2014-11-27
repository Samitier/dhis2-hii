   var hiiControllers = angular.module('hiiControllers', []);

hiiControllers.controller('listController', function($scope, $location, $translate, dhis2APIService) {
	this.init = function() {
	    //get the id for the sanitary complex program
	    dhis2APIService.getProgramId('Sanitary Complex Basic Info').then(function(data) {
	        $scope.complexProgramID = data;
	        $scope.fillList();
	    });
	    //set the language for the translations
	    dhis2APIService.getUserUiLocale().then(function(dat){
	        $translate.uses(dat);
	    });

	    $scope.isComplexOrgunit = false;
	    $scope.complexList={};

	    //watch for changes in the selected orgunit and filter the content
	    $scope.$watch('selectedOrgUnit', function() {
       		if($scope.selectedOrgUnit && $scope.complexProgramID) $scope.fillList();
   		});
	};

	$scope.fillList =function() {
		dhis2APIService.getTrackedEntitiesByProgram($scope.complexProgramID, $scope.selectedOrgUnit).then(function(dat){
	        $scope.complexList = dat;
	    });
	    dhis2APIService.getOrganizationUnitInfo($scope.selectedOrgUnit).then(function(dat) {
	    	$scope.isComplexOrgunit = (dat.children.length==0);
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
});