var hiiControllers = angular.module('hiiControllers', []);


////////////////////////////////////////////////////////////////////////////////////////////////
// The controller for initializing the metadata-related variables and the language of the app //
////////////////////////////////////////////////////////////////////////////////////////////////
hiiControllers.controller('mainController', function($scope, $translate, dhis2APIService){
    //set the language for the translations
    dhis2APIService.getUserUiLocale().then(function(dat){
        $translate.uses(dat);
    });

    dhis2APIService.getUserPermission().then(function(dat){
        $scope.permission = dat;
        if(dat == 'none') {
            alert("You have no permission to use this app, please speak with the administrator of the system");
            window.location = '/dhis-web-dashboard-integration/index.action';
        };
    });

    $scope.isGuest = function() {
        return $scope.permission == 'hii-guest';
    };

    $scope.isAdmin = function() {
        return $scope.permission == 'hii-admin';
    };

    //get the metadata info 
    dhis2APIService.gethiiProgramsInfo().then(function(data) {
        if(data ==null) alert("Please install the provided metadata to use this app");
        else {
            $scope.buildingProgramData = data.building;
            $scope.complexProgramData = data.complex;
        }
    });
});



hiiControllers.controller('listController', function($scope, $location, $translate, $interval, $filter, dhis2APIService) {
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
       		if($scope.selectedOrgUnit && $scope.complexProgramData.id) $scope.fillList();
   		});
	};

	$scope.fillList =function() {
		//we fll the list with the programs of the childs of the orgunit selected
		dhis2APIService.getTrackedEntitiesByProgram($scope.complexProgramData.id, 
		$scope.selectedOrgUnit.substr(1,$scope.selectedOrgUnit.length-2), 'DESCENDANTS').then(function(dat){
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
    	//we create a new complex with the name of the orgunit and enroll it to the basic info program
		dhis2APIService.createTEI(teid, orgunit, attributes).then(function(data){
			dhis2APIService.enrollTEI(data, $scope.complexProgramData.id).then (function(dat){
				if(dat) $location.path('/basicInfo/' + $scope.selectedOrgUnit.substr(1,$scope.selectedOrgUnit.length-2));
				else alert("Error");
			});
		});
    };

    this.deleteComplex = function(index){
        var r = confirm($filter('translate')("delete_complex_msg"));
    	if(r) {
            dhis2APIService.deleteTEI($scope.complexList.tableContents[index][0]).then(function(dat) {
        		if(!dat) alert("Error!");
        		else $scope.fillList();
        	});
            dhis2APIService.getTrackedEntitiesByProgram ($scope.buildingProgramData.id, $scope.selectedOrgUnit.substr(1,$scope.selectedOrgUnit.length-2), 'SELECTED').then(function(dat){
                var buildings = dat;
                for(var i=0; i<buildings.tableContents.length;++i) {
                    dhis2APIService.deleteTEI(buildings.tableContents[i][0]) ;
                }
            });
        }
    };

    this.gotoBasicInfoPanel = function(index) {
        $location.path('/basicInfo/' + $scope.complexList.tableContents[index][3]);
    };   
});




hiiControllers.controller('basicInfoController', function($scope, $timeout, $location, $routeParams, $filter, dhis2APIService){

    this.init = function() {
        $scope.builtSurface =0;
        $scope.imagePath = '';
        $scope.isLoading = true;
        $scope.isSending = false;
        $scope.editing=false;
        $scope.editForm = [];
        $scope.imageEditing = false;
        $scope.getTableContents();
    };

    //getting sanitary complex info
    $scope.getTableContents = function(){
        //we wait for the program data
        if($scope.complexProgramData==undefined) $timeout($scope.getTableContents, 500);
        else {
            dhis2APIService.getTrackedEntitiesByProgram($scope.complexProgramData.id, $routeParams.orgUnitId, 'SELECTED').then(function(dat){
                $scope.complexInfo = dat;
                //we wait for the response (there's a delay on the server when creating a complex)
                if($scope.complexInfo.tableContents.length==0) $scope.getTableContents();
                else if($scope.complexInfo.tableContents[0][15] !='')$scope.imagePath = '/apps/hii-images/' + $scope.complexInfo.tableContents[0][15]; 
                else $scope.imagePath = '';
                dhis2APIService.getTrackedEntitiesByProgram ($scope.buildingProgramData.id, $routeParams.orgUnitId, 'SELECTED').then(function(dat){
                    for(var i =0; i< dat.tableContents.length;++i) {
                        if(dat.tableContents[i][10] != '') $scope.builtSurface += parseInt(dat.tableContents[i][10]);
                    }
                    $scope.isLoading = false;
                });
            },
            //if someone modifies the url we return to the list page 
            function(dat) { $location.path('/list')});
        }
    };

    this.send = function() {
        $scope.isSending = true;
        var attrs = [];
        if($scope.editForm[15] != '') $scope.editForm[15]=$scope.editForm[15].split('../').join(""); //prevents from exiting the actual dir
        for (var i =5; i <$scope.editForm.length;++i) attrs.push({"attribute":$scope.complexInfo.tableHeaders[i].name ,"value": $scope.editForm[i]});
        dhis2APIService.updateTEIInfo($scope.editForm[0], $scope.complexProgramData.trackedEntity.id,$routeParams.orgUnitId,attrs).then(function(dat){
            if(!dat) alert($filter('translate')("incorrect_fields"));
            else {
                $scope.getTableContents();
                $scope.editing = false;
                $scope.imageEditing = false;
            }
            $scope.isSending = false;
        });
    };

    this.isEditing = function() {
        return $scope.editing;
    };

    this.setEditing = function(edit){
        $scope.editing = edit;
        showError = false;
        $scope.editForm=[];
        if($scope.editing) {
            $scope.imageEditing = false;
            angular.copy($scope.complexInfo.tableContents[0], $scope.editForm);
        }
    };

    this.editImage = function(edit) {
        $scope.imageEditing = edit;
        if(edit) {
            angular.copy($scope.complexInfo.tableContents[0], $scope.editForm);
            $scope.editing = false;
        }
    };

    $scope.setTab = function(n) {
    	if(n==2) $location.path('/reports/' + $routeParams.orgUnitId);
    	else if(n==3) $location.path('/buildings/' + $routeParams.orgUnitId);
    };
});




hiiControllers.controller('reportsController', function($scope, $location, $timeout, $filter, $routeParams, dhis2APIService){

    this.init = function() {
        $scope.isSendingReport = false;
        $scope.isLoading = true;
        $scope.sortingPredicate= 'eventDate';
        $scope.complexInfo = {};
        $scope.selectedReport = -1;
        $scope.reports=[];
        $scope.programStageData = {}; 
        $scope.selectedReportDataValues =[];
        $scope.editing = false;
        $scope.reportForm = [];
        $scope.reportDate = "";
        $scope.setPageData();
    };

    $scope.setPageData = function() {
        if($scope.complexProgramData ==undefined) $timeout($scope.setPageData, 500);
        else {
            dhis2APIService.getTrackedEntitiesByProgram($scope.complexProgramData.id, $routeParams.orgUnitId, 'SELECTED').then(function(dat){
                $scope.complexInfo = dat;
                //we wait for the response
                if($scope.complexInfo.tableContents.length==0) $scope.getTableContents();
            },
            //if someone modifies the url we return to the list page 
            function(dat) { $location.path('/list')});
            dhis2APIService.getProgramStage($scope.complexProgramData.programStages[0].id).then(function(data) { 
                $scope.programStageData = data.programStageSections;
                for (var i=0; i<$scope.programStageData.length; ++i) {
                   for(var j=0; j<$scope.programStageData[i].programStageDataElements.length; ++j) {
                    var nam = $scope.programStageData[i].programStageDataElements[j].dataElement.name.replace($scope.programStageData[i].name,'');
                    $scope.programStageData[i].programStageDataElements[j].dataElement.name = nam;        
                    }
                    $scope.programStageData[i].name = $scope.programStageData[i].name.replace('hii-','');
                }
            });
            $scope.fillReportList();
        }
    };

    $scope.fillReportList = function() {
        $scope.isLoading = true;
        dhis2APIService.getTECompletedEvents($scope.complexProgramData.id, $routeParams.orgUnitId).then(function(dat){
            $scope.reports = dat; //we have to sort this for date from newest to oldest
            var max='0';
            for(var i=0; i<$scope.reports.length;++i) {
                $scope.reports[i].eventDate = $scope.reports[i].eventDate.replace('00:00:00.0','');
                if(max<$scope.reports[i].eventDate){
                    max = $scope.reports[i].eventDate;
                    $scope.selectedReport=i;
                }
            } 
            if($scope.reports.length!=0) $scope.selectReport($scope.selectedReport);
            else $scope.isLoading = false;
        });
    }


    this.isEditing = function() {
        return $scope.editing ==true;
    };

    this.newReport = function() {
        $scope.selectedReport = 0;
        $scope.editing = true;
        $scope.reportForm =[];
        $scope.reportDate="";
    };

    this.sendReport = function() {
        $scope.isSendingReport = true;
        var values = [];
        var incomplete = false;
        for (var i=0; i<$scope.programStageData.length && !incomplete; ++i) {
            for(var j=0; j<$scope.programStageData[i].programStageDataElements.length; ++j) {
                var id = $scope.programStageData[i].programStageDataElements[j].dataElement.id;
                //if($scope.reportForm[id]==undefined) { incomplete=true; break;}
                values.push({"dataElement": id, "value": $scope.reportForm[id]});
            }
        }
        //if($scope.reportDate =='' || incomplete) {
        if($scope.reportDate =='') {
            $scope.isSendingReport = false;
            //alert($filter('translate')("fill_all_fields"));
            alert($filter('translate')("fill_date_field"));
        }
        else {
            dhis2APIService.sendEvent($scope.complexInfo.tableContents[0][0], $scope.complexProgramData.id, $scope.complexProgramData.programStages[0].id,$routeParams.orgUnitId, $scope.reportDate, values).then(function(data) {
                $scope.fillReportList();
                $scope.isSendingReport = false;
            });
        }
    };

    $scope.selectReport= function(item) {
        $scope.reportShowing = item;
        $scope.editing = false;
        $scope.selectedReport = item;
        $scope.selectedReportDataValues = [];
        if($scope.reports[$scope.selectedReport].dataValues) {
            for(var i=0; i<$scope.reports[$scope.selectedReport].dataValues.length;++i) {
                $scope.selectedReportDataValues[$scope.reports[$scope.selectedReport].dataValues[i].dataElement] = $scope.reports[$scope.selectedReport].dataValues[i].value;
            }
        }
        $scope.isLoading = false;
    };

    this.cancelReport = function() {
        var r = confirm($filter('translate')("cancel_report_msg"));
        if(r) {
            $scope.editing=false;
            if($scope.reports.length==0) $scope.selectedReport = -1;
        }
    };

	$scope.setTab = function(n) {
    	if(n==1) $location.path('/basicInfo/' + $routeParams.orgUnitId);
    	else if(n==3) $location.path('/buildings/' + $routeParams.orgUnitId);
    };
});



hiiControllers.controller('buildingsController', function($scope, $location, $timeout, $routeParams, $filter, dhis2APIService){
    
    this.init = function() {
        $scope.imagePath = '';
        $scope.isSending= false;
        $scope.isLoading = true;
        $scope.orgUnitId = $routeParams.orgUnitId;
        $scope.isBuildingSelected = false;
        $scope.buildingSelected =-1;
        $scope.editing = false;
        this.showError = false;
        $scope.isCreating = false;
        $scope.buildings = [];  
        this.showInfoTab = false;
        $scope.imageEditing = false;
        $scope.getComplexData();
        $scope.fillBuildingList();
    };
    
    $scope.getComplexData = function() {
        if($scope.complexProgramData ==undefined) $timeout($scope.getComplexData, 500);
        else {
            dhis2APIService.getTrackedEntitiesByProgram($scope.complexProgramData.id, $routeParams.orgUnitId, 'SELECTED').then(function(dat){
                $scope.complexInfo = dat;
                //we wait for the response
                if($scope.complexInfo.tableContents.length==0) $scope.getTableContents();
            },
            //if someone modifies the url we return to the list page 
            function(dat) { $location.path('/list')});
        }
    };

    $scope.fillBuildingList = function (selected) {
        if($scope.buildingProgramData ==undefined) $timeout($scope.fillBuildingList, 500);
        else {
        	dhis2APIService.getTrackedEntitiesByProgram ($scope.buildingProgramData.id, $scope.orgUnitId, 'SELECTED').then(function(dat){
            	$scope.buildings = dat;
                $scope.buildings.tableContents.sort(function(a,b){
                    if (a[5] < b[5]) return -1;
                    if (a[5] > b[5]) return 1;
                    return 0;
                });
            	if(selected) {
            		$scope.editing = false;
            		for(var i =0; i< $scope.buildings.tableContents.length;++i) {
            			if(selected == $scope.buildings.tableContents[i][5]) $scope.buildingSelected=i;
            		}
                    if($scope.buildings.tableContents[$scope.buildingSelected][13] == '') $scope.imagePath ='';
                    else $scope.imagePath = "/apps/hii-images/"+$scope.buildings.tableContents[$scope.buildingSelected][13];
            	}
                $scope.isLoading = false;
            },
            //if someone modifies the url we return to the list page 
            function(dat) { $location.path('/list')});
        }
    };

    this.setBasicInfoTab = function(tab) {
        this.showInfoTab = tab;
    }

    this.isBasicInfoTab = function() {
        return this.showInfoTab == true;
    }

    this.selectBuilding = function(index){
        this.showInfoTab = true;
        $scope.isBuildingSelected = true;
        $scope.isCreating = false;
        $scope.editing = false;
        $scope.imageEditing = false;
        $scope.buildingSelected = index;
        if($scope.buildings.tableContents[$scope.buildingSelected][13] == '') $scope.imagePath ='';
        else $scope.imagePath = '/apps/hii-images/'+$scope.buildings.tableContents[$scope.buildingSelected][13];
    };

    this.addBuilding = function(){
        this.showInfoTab = true;
    	$scope.isCreating = true;
        $scope.isBuildingSelected = true;
        $scope.buildingSelected = $scope.buildings.length;
        $scope.editing = true;
        $scope.editForm =[];
        for(var i=0; i< $scope.buildings.tableContents.length ;++i) {
        	$scope.editForm[i]='';
        }
    };
    
    this.isEditing = function() {
        return $scope.editing;
    };

    this.setEditing = function(edit){
        if(!$scope.isCreating) {
        	$scope.editing = edit;
        	showError = false;
        	$scope.editForm=[];
        	if($scope.editing) {
                $scope.imageEditing = false;
                angular.copy($scope.buildings.tableContents[$scope.buildingSelected], $scope.editForm);
            }
        }
    };

    this.editImage = function(edit) {
        if(!$scope.isCreating) {
            $scope.imageEditing = edit;
            $scope.editForm=[];
            if(edit) {
                angular.copy($scope.buildings.tableContents[$scope.buildingSelected], $scope.editForm);
                $scope.editing = false;
            }
        }
    };

    this.deleteBuilding = function() {
        var r = confirm($filter('translate')("delete_building_msg"));
        if(r) {
            dhis2APIService.deleteTEI($scope.buildings.tableContents[$scope.buildingSelected][0]).then(function(dat) {
                if(!dat) alert("Error!");
                else {
                    $scope.fillBuildingList();
                    $scope.isBuildingSelected = false;
                    $scope.imagePath = '';
                    $scope.buildingSelected =-1;
                }
            });
        }
    }

    
    this.send = function() {
        $scope.isSending = true;
        var attrs = [];
        if( $scope.editForm[13]) if($scope.editForm[13] != '') $scope.editForm[13]=$scope.editForm[13].split('../').join(""); //prevents from exiting the actual dir
        for (var i =5; i <$scope.editForm.length;++i) attrs.push({"attribute":$scope.buildings.tableHeaders[i].name ,"value": $scope.editForm[i]});
        if($scope.isCreating){
            if(!$scope.editForm[5]) {
                $scope.isSending = false;
                alert($filter('translate')("insert_name"));
            }
            else {
                dhis2APIService.createTEI($scope.buildingProgramData.trackedEntity.id, $scope.orgUnitId, attrs).then(function(dat){
                    if(dat) {
                        dhis2APIService.enrollTEI(dat, $scope.buildingProgramData.id).then(function(data) {
                            $scope.isCreating = false;
                            $scope.fillBuildingList(attrs[0].value);
                            $scope.isSending= false;
                            $scope.imageEditing = false;
                        });
                    }
                    else {
                        $scope.isSending= false;
                        alert($filter('translate')("incorrect_fields"));
                    }
                });
            }
        }
        else {
            dhis2APIService.updateTEIInfo($scope.editForm[0], $scope.buildingProgramData.trackedEntity.id,$scope.orgUnitId,attrs).then(function(dat){
                if(dat) $scope.fillBuildingList(attrs[0].value);
                else alert($filter('translate')("incorrect_fields"));
                $scope.isSending = false;
                $scope.imageEditing = false;
            });
        }
    };

    $scope.setTab = function(n) {
    	if(n==1) $location.path('/basicInfo/' + $routeParams.orgUnitId);
    	else if(n==2) $location.path('/reports/' + $routeParams.orgUnitId);
    };
});


hiiControllers.controller('buildingReportController', function($scope, $timeout, $filter, dhis2APIService){

    this.init = function() {
        $scope.isSendingReport = false;
        $scope.isLoadingReports = true;
        $scope.sortingPredicate= 'eventDate';
        $scope.complexInfo = {};
        $scope.selectedReport = -1;
        $scope.reports=[];
        $scope.programStageData = {}; 
        $scope.selectedReportDataValues =[];
        $scope.editing = false;
        $scope.reportForm = [];
        $scope.reportDate = "";
        if($scope.buildings.length!=0) $scope.setMetadata();
    };
    

    $scope.setMetadata = function() {
        //set the program metadata;
        if($scope.buildingProgramData == undefined) $timeout($scope.setMetadata,500);
        else {
            $scope.isLoadingReports = true;
            dhis2APIService.getProgramStage($scope.buildingProgramData.programStages[0].id).then(function(data) { 
               $scope.programStageData = data.programStageSections;
               for (var i=0; i<$scope.programStageData.length; ++i) {
                   for(var j=0; j<$scope.programStageData[i].programStageDataElements.length; ++j) {
                        var nam = $scope.programStageData[i].programStageDataElements[j].dataElement.name.replace($scope.programStageData[i].name,'');
                        $scope.programStageData[i].programStageDataElements[j].dataElement.name = nam;        
                   }
                   $scope.programStageData[i].name = $scope.programStageData[i].name.replace('hii-','');
               }
            });
            if($scope.buildingSelected != -1)$scope.fillReportList();
        }
    };

    $scope.fillReportList = function() {
        dhis2APIService.getTEICompletedEvents($scope.buildingProgramData.id, $scope.buildings.tableContents[$scope.buildingSelected][0], $scope.orgUnitId).then(function(dat){
            $scope.reports = dat; //we have to sort this for date from newest to oldest
            var max='0';
            for(var i=0; i<$scope.reports.length;++i) {
                $scope.reports[i].eventDate = $scope.reports[i].eventDate.replace('00:00:00.0','');
                if(max<$scope.reports[i].eventDate){
                    max = $scope.reports[i].eventDate;
                    $scope.selectedReport=i;
                }
            } 
            if($scope.reports.length!=0)$scope.selectReport($scope.selectedReport);
            else $scope.isLoadingReports = false;
        });
    };

    this.isEditing = function() {
        return $scope.editing ==true;
    };

    this.newReport = function() {
        $scope.selectedReport = 0;
        $scope.editing = true;
        $scope.reportForm =[];
        $scope.reportDate="";
    };

    this.sendReport = function() {
        $scope.isSendingReport = true;
        var values = [];
        var incomplete = false;
        for (var i=0; i<$scope.programStageData.length && !incomplete; ++i) {
            for(var j=0; j<$scope.programStageData[i].programStageDataElements.length; ++j) {
                var id = $scope.programStageData[i].programStageDataElements[j].dataElement.id;
                //if($scope.reportForm[id] == undefined) {incomplete = true; break;}
                values.push({"dataElement": id, "value": $scope.reportForm[id]});
            }
        }
        //if(incomplete || $scope.reportDate =='') { //incomplete lets us check if all fieldshave been filled
        if($scope.reportDate =='') {
            //alert($filter('translate')("fill_all_fields"));
            alert($filter('translate')("fill_date_field"));
            $scope.isSendingReport= false;
        }
        else {
            dhis2APIService.sendEvent($scope.buildings.tableContents[$scope.buildingSelected][0], $scope.buildingProgramData.id, $scope.buildingProgramData.programStages[0].id,$scope.orgUnitId, $scope.reportDate, values).then(function(data) {
                $scope.fillReportList();
                $scope.isSendingReport = false;
            });
        }
    };

    this.cancelReport = function() {
        var r = confirm($filter('translate')("cancel_report_msg"));
        if(r) {
            $scope.editing=false;
            if($scope.reports.length==0) $scope.selectedReport = -1;
        }
    };

    $scope.selectReport= function(item) {
        $scope.reportShowing = item;
        $scope.editing = false;
        $scope.selectedReport = item;
        $scope.selectedReportDataValues = [];
        if($scope.reports[$scope.selectedReport].dataValues) {
            for(var i=0; i<$scope.reports[$scope.selectedReport].dataValues.length;++i) {
                $scope.selectedReportDataValues[$scope.reports[$scope.selectedReport].dataValues[i].dataElement] = $scope.reports[$scope.selectedReport].dataValues[i].value;
            }
        }
        $scope.isLoadingReports = false;
    };

});

hiiControllers.controller('settingsController', function($rootScope, $scope, $filter, dhis2FrontEndService, dhis2APIService, metadataGetter){
    this.init = function() {
        $scope.entitySelected = -1; //0 sanitary complex, 1 building
        $scope.isAddingFields = false;
        $scope.fieldSelected = -1;
        $scope.programStageData ={};
        $scope.isEditing = false;
        $scope.editForm = {};
        dhis2APIService.getOptionSets().then(function(dat){
            $scope.optionSets = dat;
        });
    };

    this.installMetadata = function() {
        metadataGetter.getTE().then(function(dat){console.dir(dat)});
    };

    this.setEntity = function(n) {
        $scope.entitySelected = n;
        if(n==1) {
            this.title = $filter('translate')("building_fields");
            this.btn2 = "active";this.btn1='';
        }
        else {
            this.title = $filter('translate')("complex_fields");
            this.btn1 = "active";this.btn2='';
        }
        $scope.getFields();
    };

    this.setEditing = function(edit) {
        if(edit) {
            $scope.isEditing = true;
            $scope.editForm = {name: '', description: '', fields:[]};
        }
        else {
           $scope.isEditing = false;
           $scope.editForm = {};
        }
    }

    $scope.getFields = function() {
        var programStage;
        if($scope.entitySelected==1) programStage = $scope.buildingProgramData.programStages[0].id;
        else programStage = $scope.complexProgramData.programStages[0].id;
        dhis2APIService.getProgramStage(programStage).then(function(data) { 
           $scope.programStageData = data.programStageSections;
           for (var i=0; i<$scope.programStageData.length; ++i) {
               for(var j=0; j<$scope.programStageData[i].programStageDataElements.length; ++j) {
                    var nam = $scope.programStageData[i].programStageDataElements[j].dataElement.name.replace($scope.programStageData[i].name,'');
                    $scope.programStageData[i].programStageDataElements[j].dataElement.name = nam;        
               }
               $scope.programStageData[i].name = $scope.programStageData[i].name.replace('hii-','');
           }
        });
    };

    this.selectField = function(n) {
        this.setEditing(false);
        $scope.fieldSelected= n;
    };

    this.createField = function() {
        var empty = false;
        for(var i=0; i< $scope.editForm.fields.length && !empty;++i) {
            if($scope.editForm.fields[i].name == '' || $scope.editForm.fields[i].type == '') empty=true;
        }
        if(empty || $scope.editForm.name ==''|| $scope.editForm.description =='') {
            alert($filter('translate')("fill_all_fields"));
        }
        else {
           var ids =[];
           var dataElements = [];
           $scope.editForm.name ='hii-' + $scope.editForm.name;
           for(var i=0; i< $scope.editForm.fields.length;++i) {
                dataElements.push({name:$scope.editForm.name + ' ' + $scope.editForm.fields[i].name, type:$scope.editForm.fields[i].type,
                                   optionSet:$scope.editForm.fields[i].optionSet, comment: $scope.editForm.description});
            }
            dataElements.push({name: $scope.editForm.name + ' Comments', type:"string",optionSet:'', 
                                comment: $scope.editForm.description});
            $scope.createDataElements(dataElements, 0);
        }
    };

    $scope.createDataElements = function(dataElements, i) {
        dhis2APIService.createDataElement($scope.editForm.name , dataElements[i].name, dataElements[i].type, dataElements[i].optionSet, dataElements[i].comment).
            then(function(dat){
                if(i<dataElements.length-1) $scope.createDataElements(dataElements,++i);
                //else $scope.assignDataElementsToProgram(dataElements); <- doesn't work, the user will have to do it manually
                else {
                    //manual operations
                    var program, programStage;
                    if($scope.entitySelected==1) {
                        program = $scope.buildingProgramData.id;
                        programStage = $scope.buildingProgramData.programStages[0].id;
                    }
                    else {
                        program = $scope.complexProgramData.id;
                        programStage = $scope.complexProgramData.programStages[0].id;
                    }   
                    dhis2FrontEndService.getProgramStageFrontEndId(program, programStage);      
                }
        });
    };

    /*
    //It appears you can't modify the data of a program stage via web API. I've tried everything and, or deletes the programStageSections 
    //or you get a internal server error.
    $scope.assignDataElementsToProgram = function(dataElements) {
        //this won't be needed if DHIS2 reurned the id of the data element added
        dhis2APIService.getDataElementsIdByName(dataElements).then(function(data) {
            console.dir(data);
            var program, programStage;
            if($scope.entitySelected==1) {
                program = $scope.buildingProgramData.id;
                programStage = $scope.buildingProgramData.programStages[0].id;
            }
            else {
                program = $scope.complexProgramData.id;
                programStage = $scope.complexProgramData.programStages[0].id;
            }
            dhis2APIService.getProgramStageData(programStage).then(function(dat){
                var element = angular.copy(dat.programStageDataElements[0]);
                for(var i=0; i<data.length;++i) {
                    element.sortOrder = i+dat.programStageDataElements.length;
                    element.dataElement.id = data[i];
                    element.dataElement.name = dataElements[i].name;
                    dat.programStageDataElements.push(element);
                }
                console.dir(dat);
                dhis2APIService.updateProgramStage(dat);
            });
        });
    };
    */
    this.finishAdding = function() {
        $scope.isAddingFields = false;
        $scope.fieldSelected = -1;
        this.setEditing(false);
        $scope.getFields();
    }

    this.addSection = function() {
        $scope.editForm.fields.push({name:'', type:'string', optionSet:''});
    }

    this.deleteField = function(n) {
        var r =  confirm($filter('translate')("confirmation_delete_fields"));
        if(r) {
            var program, programStage;
            if($scope.entitySelected==1) {
                program = $scope.buildingProgramData.id;
                programStage = $scope.buildingProgramData.programStages[0].id;
            }
            else {
                program = $scope.complexProgramData.id;
                programStage = $scope.complexProgramData.programStages[0].id;
            }/*
            //This is for deleting the data elements from the program, but doing this will also unlink them to the programStageSection
            //possible DHIS2 bug/limitation?
            dhis2APIService.getProgramStageData(programStage).then(function(dat){
                for(var i=0; i<dat.programStageDataElements.length;++i) {
                    for(var j=0; j<$scope.programStageData[$scope.fieldSelected].programStageDataElements.length;++j) {
                        if(dat.programStageDataElements[i].dataElement.id == $scope.programStageData[$scope.fieldSelected].programStageDataElements[j].dataElement.id) {
                            dat.programStageDataElements.splice(i,1);
                        }
                    }
                }
                for(var i=0; i<dat.programStageSections.length;++i) {
                    if(dat.programStageSections[i].id == $scope.programStageData[$scope.fieldSelected].id) {
                       dat.programStageSections.splice(i,1);
                    }
                }
                dhis2APIService.updateProgramStage(dat);
            });*/
            dhis2FrontEndService.deleteProgramStageSection(program, programStage, $scope.programStageData[$scope.fieldSelected].id);
        }
    };

    $rootScope.$on('endOfIdPetition', function(event, data){
        $scope.isAddingFields = true;
        $scope.url1 = '/dhis-web-maintenance-program/showUpdateProgramStageForm.action?id=' + data;
        $scope.url2 = '/dhis-web-maintenance-program/programStageSectionList.action?id=' + data;
    });

    $rootScope.$on('endOfPetition', function(event, data) { 
        if(data) {
            $scope.getFields(); 
            $scope.fieldSelected =-1;
        }
        else {
            alert('An error has ocurred.');
        }
    });
});

