

var hiiControllers = angular.module('hiiControllers', []);


hiiControllers.controller('mainController', function($scope, $translate, dhis2APIService){
    //set the language for the translations
    dhis2APIService.getUserUiLocale().then(function(dat){
        $translate.uses(dat);
    });
    //get the id for the sanitary complex basic info program
    dhis2APIService.getProgramId('Sanitary Complex Basic Info').then(function(data) {
        $scope.complexProgramID = data;
        //get the program data (for the attributes)
        dhis2APIService.getProgramData($scope.complexProgramID).then(function(dat){ $scope.complexProgramData = dat;});
    });
    //get the id for the buildings basic info program
    dhis2APIService.getProgramId('Building Basic Info').then(function(data) {
        $scope.buildingProgramID = data;
    });

    dhis2APIService.getTrackedEntityId("Building").then(function(data) {
    	$scope.buildingTEid = data;
    });
});

hiiControllers.controller('listController', function($scope, $location, $translate, $interval, dhis2APIService) {
	this.init = function() {
        $scope.isComplexOrgunit = false;
	    $scope.complexList={};
        $scope.selectedOrgUnit;
        $scope.loadingList = true;

        //this interval will work as an artificial $watch for the outside variable sessionStorage.ouSelected
        $interval(function() {
            if(sessionStorage.ouSelected != $scope.selectedOrgUnit) {
                $scope.selectedOrgUnit = sessionStorage.ouSelected;
                $scope.loadingList = true;
            }
        }, 400);

	    //watch for changes in the selected orgunit and filter the content
	    $scope.$watch('selectedOrgUnit', function() {
       		if($scope.selectedOrgUnit && $scope.complexProgramID) $scope.fillList();
   		});
	};

	$scope.fillList =function() {
		//we fll the list with the programs of the childs of the orgunit selected
		dhis2APIService.getTrackedEntitiesByProgram($scope.complexProgramID, 
		$scope.selectedOrgUnit.substr(1,$scope.selectedOrgUnit.length-2), 'SELECTED').then(function(dat){
	        $scope.complexList = dat;
	    });
	    //we check if the organization unit selected have children to show or hide the button of creation and for saving its name
	    dhis2APIService.getOrganizationUnitInfo($scope.selectedOrgUnit).then(function(dat) {
	    	$scope.selectedOrgUnitName = dat.name; 
	    	$scope.isComplexOrgunit = (dat.children.length==0);
	    	$scope.loadingList = false;
	    });
	};

    this.createComplex = function(){
    	var teid = $scope.complexProgramData.trackedEntity.id;
    	var orgunit = $scope.selectedOrgUnit.substr(1,$scope.selectedOrgUnit.length-2); //we have to erase the "" of the orgunit id
    	var attributes = [{ "attribute": $scope.complexProgramData.programTrackedEntityAttributes[0].trackedEntityAttribute.id,
    						 "value": $scope.selectedOrgUnitName}];
    	//we put "-" to all attributes, so DHIS2 saves them in the TEI
    	for(var i=1; i< $scope.complexProgramData.programTrackedEntityAttributes.length;++i){
    		attributes.push({ "attribute": $scope.complexProgramData.programTrackedEntityAttributes[i].trackedEntityAttribute.id,"value": "-"});
    	}
    	//we create a new complex with the name of the orgunit and enroll it to the basic info program
		dhis2APIService.createTEI(teid, orgunit, attributes).then(function(data){
			dhis2APIService.enrollTEI(data, $scope.complexProgramData.id).then (function(dat){
				if(dat) $location.path('/basicInfo/' + data);
				else alert("Error");
			});
		});
    };

    this.deleteComplex = function(index){
    	dhis2APIService.deleteTEI($scope.complexList.tableContents[index][0]).then(function(dat) {
    		if(!dat) alert("Error!");
    		else $scope.fillList();
    	});
    };

    this.gotoBasicInfoPanel = function(index) {
        $location.path('/basicInfo/' + $scope.complexList.tableContents[index][0]);
    };   
});


hiiControllers.controller('basicInfoController', function($scope, $location, $routeParams, dhis2APIService){
	$scope.editing=false;
    $scope.editForm = {};
    this.showError = false;

    //getting sanitary complex info
    dhis2APIService.getTrackedEntityById($routeParams.complexId).then(function(dat){
        $scope.complexInfo = dat;
    });

    this.send = function() {
    	for(var i =0; i< $scope.editForm.attributes.length;++i) {
        		if($scope.editForm.attributes[i].value == "") $scope.editForm.attributes[i].value = "-";
        }
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
        if($scope.editing) {
        	//we copy the attributes into the new form and erase the "-"
        	angular.copy($scope.complexInfo, $scope.editForm);
        	for(var i =0; i< $scope.complexInfo.attributes.length;++i) {
        		if($scope.complexInfo.attributes[i].value == "-") $scope.editForm.attributes[i].value = "";
        	}
        }
    };

    $scope.setTab = function(n) {
    	if(n==2) $location.path('/reports/' + $routeParams.complexId);
    	else if(n==3) $location.path('/buildings/' + $routeParams.complexId);
    };
});

hiiControllers.controller('reportsController', function($scope, $location, $routeParams, dhis2APIService){
	$scope.setTab = function(n) {
    	if(n==1) $location.path('/basicInfo/' + $routeParams.complexId);
    	else if(n==3) $location.path('/buildings/' + $routeParams.complexId);
    };
});

hiiControllers.controller('buildingsController', function($scope, $location, $routeParams, dhis2APIService){

    $scope.isBuildingSelected = false;
    $scope.buildingSelected =-1;
    $scope.editing = false;
    this.showError = false;
    this.isCreating = false;
    $scope.buildings = [];  

	dhis2APIService.getTrackedEntityById($routeParams.complexId).then(function(dat){
        $scope.complexInfo = dat;
        $scope.fillBuildingList();
    });

    $scope.fillBuildingList = function (selected) {
    	dhis2APIService.getTrackedEntitiesByProgram ($scope.buildingProgramID, $scope.complexInfo.orgUnit, 'SELECTED').then(function(dat){
        	$scope.buildings = dat;
        	if(selected) {
        		$scope.editing = false;
        		for(var i =0; i< $scope.buildings.tableContents.length;++i) {
        			if(selected == $scope.buildings.tableContents[i][5]) $scope.buildingSelected=i;
        		}
        	}
        });
    }

    this.selectBuilding = function(index){
        $scope.isBuildingSelected = true;
        this.isCreating = false;
        $scope.editing = false;
        $scope.buildingSelected = index;
    };

    this.addBuilding = function(){
    	this.isCreating = true;
        $scope.isBuildingSelected = true;
        $scope.buildingSelected = $scope.buildings.length;
        $scope.editing = true;
        $scope.editForm =[];
        for(var i=0; i< $scope.buildings.tableContents.length ;++i) {
        	$scope.editForm[i]='';
        }
    };

    this.deleteBuilding = function() {
    	dhis2APIService.deleteTEI($scope.buildings.tableContents[$scope.buildingSelected][0]).then(function(dat) {
    		if(!dat) alert("Error!");
    		else {
    			$scope.fillBuildingList();
    			$scope.isBuildingSelected = false;
    			$scope.buildingSelected =-1;
    		}
    	});
    }

    
    this.send = function() {
    	var attrs = [];
    	for (var i =5; i <$scope.editForm.length;++i) attrs.push({"attribute":$scope.buildings.tableHeaders[i].name ,"value": $scope.editForm[i]});
    	
    	if(this.isCreating){
    		dhis2APIService.createTEI($scope.buildingTEid, $scope.complexInfo.orgUnit, attrs).then(function(dat){
		        if(dat) {
		        	dhis2APIService.enrollTEI(dat, $scope.buildingProgramID).then(function(data) {
		        		$scope.fillBuildingList(attrs[0].value);
		        	});
		        }
		        else this.showError= true; //currently not showing error
		    });
    		this.isCreating=false;
    	}
    	else {
		    dhis2APIService.updateTEIInfo($scope.editForm[0], $scope.buildingTEid,$scope.complexInfo.orgUnit,attrs).then(function(dat){
		        $scope.fillBuildingList(attrs[0].value);
		    });
		}
    };

    this.isEditing = function() {
        return $scope.editing;
    };

    this.setEditing = function(edit){
        if(!this.isCreating) {
        	$scope.editing = edit;
        	showError = false;
        	$scope.editForm=[];
        	if($scope.editing) angular.copy($scope.buildings.tableContents[$scope.buildingSelected], $scope.editForm);
        }
    };
    $scope.setTab = function(n) {
    	if(n==1) $location.path('/basicInfo/' + $routeParams.complexId);
    	else if(n==2) $location.path('/reports/' + $routeParams.complexId);
    };
});

hiiControllers.controller('settingsController', function($scope){
});

