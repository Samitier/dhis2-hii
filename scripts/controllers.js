   var hiiControllers = angular.module('hiiControllers', []);

hiiControllers.controller('listController', function($scope, $location, $translate, $interval, dhis2APIService) {
	this.init = function() {
        $scope.selectedOrgUnit = sessionStorage.ouSelected;
        //this interval will work as an artificial $watch for the outside variable sessionStorage.ouSelected
        $interval(function() {
                if(sessionStorage.ouSelected != $scope.selectedOrgUnit) {
                    $scope.selectedOrgUnit = sessionStorage.ouSelected;
                }
        }, 400);
        
	    //set the language for the translations
	    dhis2APIService.getUserUiLocale().then(function(dat){
	        $translate.uses(dat);
	    });
	    //get the id for the sanitary complex program
	    dhis2APIService.getProgramId('Sanitary Complex Basic Info').then(function(data) {
	        $scope.complexProgramID = data;
	        $scope.fillList();
	        //get the program data (for the attributes)
	        dhis2APIService.getProgramData($scope.complexProgramID).then(function(dat){ $scope.programData = dat;});
	    });

	    $scope.isComplexOrgunit = false;
	    $scope.complexList={};

	    //watch for changes in the selected orgunit and filter the content
	    $scope.$watch('selectedOrgUnit', function() {
       		if($scope.selectedOrgUnit && $scope.complexProgramID) $scope.fillList();
   		});
	};

	$scope.fillList =function() {
		//we fll the list with the programs of the childs of the orgunit selected
		dhis2APIService.getTrackedEntitiesByProgram($scope.complexProgramID, $scope.selectedOrgUnit).then(function(dat){
	        $scope.complexList = dat;
	    });
	    //we check if the organization unit selected have children to show or hide the button of creation and for saving its name
	    dhis2APIService.getOrganizationUnitInfo($scope.selectedOrgUnit).then(function(dat) {
	    	$scope.selectedOrgUnitName = dat.name; 
	    	$scope.isComplexOrgunit = (dat.children.length==0);
	    });
	};

    this.setBasicInfoPanel = function(index) {
        $location.path('/detail/' + $scope.complexList.tableContents[index][0]);
    };      

    this.createComplex = function(){
    	//we create the new TEI and send it to the service
    	var message = {"trackedEntity": $scope.programData.trackedEntity.id,
    					"orgUnit": 		$scope.selectedOrgUnit.substr(1,$scope.selectedOrgUnit.length-2),
    					"attributes": []};
    	for(var i=0; i< $scope.programData.programTrackedEntityAttributes.length;++i){
    		message.attributes.push({ "attribute": $scope.programData.programTrackedEntityAttributes[i].trackedEntityAttribute.id,"value": ""});
    	}
    	message.attributes[0].value = $scope.selectedOrgUnitName; //we set the name of the TEI equal to the org unit selected
		dhis2APIService.createTEI(message).then(function(dat){
			dhis2APIService.enrollTEI(dat, $scope.programData.id).then (function(dat){console.dir(dat);});
		});
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