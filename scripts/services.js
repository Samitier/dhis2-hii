var hiiServices = angular.module('hiiServices', []);


hiiServices.factory('dhis2APIService', function($http){
    

    var serviceFactory={

      gethiiProgramsInfo: function(pnames) {
        var pnames = ['hii - Sanitary Complex Infrastructure Program', 'hii - Building Infrastructure Program'];
        var promise = $http.get('/api/programs?fields=name,id,trackedEntity[id],programTrackedEntityAttributes[trackedEntityAttribute[id,name,valueType]],programStages').then(function(response){
          result = {building:null,complex:null};
          for(var i=0; i<response.data.programs.length;++i) {
              if(response.data.programs[i].name == pnames[0]) result.complex = response.data.programs[i];
              else if (response.data.programs[i].name == pnames[1]) result.building = response.data.programs[i];
              if(result.building!= null && result.complex != null) return result;
          }
          return null;
        });
        return promise;
      },

      getTrackedEntitiesByProgram : function(programId, orgunit, oumode) {
        var promise  = $http.get('/api/trackedEntityInstances.json?ou=' + orgunit
          + '&ouMode=' + oumode +'&program='+ programId).then(function(response){
          var info = {tableHeaders:response.data.headers,tableContents:response.data.rows};
          return info;
        });
        return promise;
      },

      getOrganizationUnitInfo : function(orgunit) {
        var promise  = $http.get('/api/organisationUnits/' + orgunit.substr(1,orgunit.length-2)).then(function(response){
          return response.data;
        });
        return promise;
      },

      updateTEIInfo : function(id, te, ou, atts){
        var message = { "trackedEntity": te,
                        "orgUnit": ou,
                        "attributes": atts
        };
        var promise = $http.put('/api/trackedEntityInstances/'+id, JSON.stringify(message)).then(function(response){
          return (response.data.status =="SUCCESS");
        });
        return promise;
      },

      getUserUiLocale : function(){
        var promise = $http.get('/api/me/profile').then(function(response){
          if(response.data.settings.keyUiLocale == null) return 'en';
          else return response.data.settings.keyUiLocale;
        });
        return promise;
      },

      getUserPermission: function() {
        var promise = $http.get('/api/me/').then(function(response){
          var nam = "none";
          for(var i=0; i<response.data.userCredentials.userAuthorityGroups.length;++i){
            if(response.data.userCredentials.userAuthorityGroups[i].name == 'hii-user') nam = 'hii-user';
            else if(response.data.userCredentials.userAuthorityGroups[i].name == 'hii-admin') nam = 'hii-admin';
            else if(response.data.userCredentials.userAuthorityGroups[i].name == 'Superuser') nam = 'hii-admin';
            else if(response.data.userCredentials.userAuthorityGroups[i].name == 'hii-guest') nam = 'hii-guest';
          }
          return nam;
        });
        return promise;
      },

      createTEI : function(TEid, orgunit, attributes) {
        var msg = {"trackedEntity": TEid,
                   "orgUnit":    orgunit,
                   "attributes": attributes};
        var promise = $http.post('/api/trackedEntityInstances/', JSON.stringify(msg)).then(function(response){
          return response.data.reference;
        });
        return promise;
      },

      enrollTEI : function(TEIid, programid){
        var msg = {"trackedEntityInstance": TEIid, "program": programid, "dateOfEnrollment": "", 
        "dateOfIncident": ""};
        var promise = $http.post('/api/enrollments/', JSON.stringify(msg)).then(function(response){
          return (response.data.status =="SUCCESS");
        });
        return promise;
      },

      deleteTEI: function(id) {
        var promise = $http.delete('/api/trackedEntityInstances/'+id).then(function(response){
          return true; //must return false if can't delete
        });
        return promise;
      },

      getProgramStage: function (id) {
        var promise = $http.get('/api/programStages/'+id + '?fields=programStageSections[id,name,programStageDataElements[dataElement[id,name,description,type,optionSet[name,options]]]').then(function(response){
          return response.data;
        });
        return promise;
      },

      getProgramStageData: function (id) {
        var promise = $http.get('/api/programStages/'+id ).then(function(response){
          return response.data;
        });
        return promise;
      },

      updateProgramStage: function(data) {
        var promise = $http.post('/api/programStages/' + data.id, JSON.stringify(data)).then(function(response){
          console.dir(response);
        }, function(dat){console.dir(dat);});
        return promise;  
      },

      getTECompletedEvents: function(program, orgunit){
        var promise = $http.get('/api/events?program='+program+'&orgUnit='+orgunit + '&satus=COMPLETED').then(function(response){
          if(response.data.events)return response.data.events;
          else return [];
        });
        return promise;
      },

      getTEICompletedEvents: function(program, instance, orgunit){
        var promise = $http.get('/api/events?program='+program+'&orgUnit='+orgunit + '&trackedEntityInstance=' + instance +'&satus=COMPLETED').then(function(response){
          if(response.data.events)return response.data.events;
          else return [];
        });
        return promise;
      },

      getDataElementsIdByName: function(dataElements) {
        var promise = $http.get('/api/dataElements?fields=name,id').then(function(response){
          var ids = [];
          for(var i=0; i< response.data.dataElements.length;++i) {
            for(var j=0; j < dataElements.length;++j) {
              if(response.data.dataElements[i].name == dataElements[j].name) ids.push(response.data.dataElements[i].id);
            }
          }
          return ids;
        });
        return promise;
      },

      deleteDataElement:function(id) {
        var promise = $http.delete('/api/dataElements/'+id).then(function(response){
          console.dir(response);
          return true;
        }, function(err){console.dir(err)});
        return promise;
      },

      getOptionSets: function() {
        var promise = $http.get('/api/optionSets?fields=name,id').then(function(response){
          if(response.data)return response.data.optionSets;
          else return [];
        });
        return promise;
      },

      createDataElement: function(sectionName, name, type, optionSet, comment) {
        var shortName = (name.replace(sectionName, '') + sectionName).substring(0,49);
        var msg = { "name":name, "shortName":shortName, "description":comment, "domainType":"TRACKER", "type":type, "numberType":"number",
                    "textType":"text", "aggregationOperator":"sum", "optionSet":{id:optionSet}};
        var promise = $http.post('/api/dataElements/', JSON.stringify(msg)).then(function(response){
        }, function(err) { console.dir(err)});
        return promise;
      },

      sendEvent: function(teid, prog, stage, ou, date, values) {
        var msg = { "trackedEntityInstance": teid, 
                    "program": prog,
                    "programStage":stage,
                    "orgUnit": ou,
                    "eventDate": date,
                    "status": "COMPLETED",             
                    "dataValues": values};
        var promise = $http.post('/api/events/', JSON.stringify(msg)).then (function(response) {
            return response;
        });
        return promise;
      },

      getUsers: function() {
        var promise = $http.get('/api/users?fields=name,id').then (function(response) {
            return response.data.users;
        });
        return promise;
      },
  };

  return serviceFactory;
});

hiiServices.factory('metadataGetter', function($http){
  var serviceFactory={
    getTEAttributes: function(){
      var promise = $http.get('metadata/trackedEntityAttributes.json').then(function(response){
        return response;
      });
      return promise;
    },
    getTE: function() {
      var promise = $http.get('metadata/trackedEntities.json').then(function(response){
        return response;
      });
      return promise;
    },
  };
  return serviceFactory;
});


hiiServices.factory('dhis2FrontEndService', function($http, $rootScope){
  var serviceFactory={
    getProgramStageFrontEndId:function(programId, programStageId){
      $http.get('/dhis-web-maintenance-program/program.action').then(function(response){
        var htmlResponse = $(response.data);
        var htmlList = $('#list', htmlResponse);
        for (var i=0; i<htmlList[0].children.length;++i) {
          if(programId == htmlList[0].children[i].dataset.uid) {
            $http.get('/dhis-web-maintenance-program/programStage.action?id=' + htmlList[0].children[i].dataset.id).then(function(response){
              var htmlResponse = $(response.data);
              var htmlList = $('#list', htmlResponse);
              for (var i=0; i<htmlList[0].children.length;++i) {
                if(programStageId == htmlList[0].children[i].dataset.uid) {
                  $rootScope.$broadcast('endOfIdPetition',htmlList[0].children[i].dataset.id);
                  return true;
                }
              }
            });
          }
        }
      });
      return true;
    },

    deleteProgramStageSection:function(programId, programStageId, sectionId) {
      $http.get('/dhis-web-maintenance-program/program.action').then(function(response){
        var htmlResponse = $(response.data);
        var htmlList = $('#list', htmlResponse);
        for (var i=0; i<htmlList[0].children.length;++i) {
          if(programId == htmlList[0].children[i].dataset.uid) {
            $http.get('/dhis-web-maintenance-program/programStage.action?id=' + htmlList[0].children[i].dataset.id).then(function(response){
              var htmlResponse = $(response.data);
              var htmlList = $('#list', htmlResponse);
              for (var i=0; i<htmlList[0].children.length;++i) {
                if(programStageId == htmlList[0].children[i].dataset.uid) {
                  $http.get('/dhis-web-maintenance-program/programStageSectionList.action?id=' + htmlList[0].children[i].dataset.id).then(function(response){
                    var htmlResponse = $(response.data);
                    var htmlList = $('#list', htmlResponse);
                    for (var i=0; i<htmlList[0].children.length;++i) {
                      if(sectionId == htmlList[0].children[i].dataset.uid) {
                        $.ajax({ url:'/dhis-web-maintenance-program/removeProgramStageSection.action', data:{"id": htmlList[0].children[i].dataset.id}, success:function( json ){
                          if ( json.response == "success" ) $rootScope.$broadcast('endOfPetition',true);
                          else $rootScope.$broadcast('endOfPetition',false);
                        }, type:'post', dataType:'json', contentType:'application/x-www-form-urlencoded;charset=utf-8' } );
                        break;
                  }}});
                  break;
            }}});
            break;
        }}});
      return true;
    },
  }
  return serviceFactory;
});