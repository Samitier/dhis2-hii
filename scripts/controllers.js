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
	    dhis2APIService.getTrackedEntityById($routeParams.complexId).then(function(dat){
	        $scope.complexInfo = dat;
	    }); 
		$scope.showOrgUnitTree(false);
		$scope.editing=false;
	    this.tab =1;
	    this.showError = false;
	};
    this.send = function() {
        /*var message = {trackedEntity: $scope.complexData.tableContents[$scope.indexComplex][4], 
                       orgUnit: $scope.complexData.tableContents[$scope.indexComplex][3], 
                       attributes: []};
        for(var i=5; i< this.inputInfo.length; ++i) {
            message.attributes.push({attribute:$scope.complexData.tableHeaders[i].name, value: this.inputInfo[i]});
        }
        console.dir(message);*/
        dhis2APIService.updateComplexInfo($routeParams.complexId,$scope.editForm).then(function(dat){
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