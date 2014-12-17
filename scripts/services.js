var hiiServices = angular.module('hiiServices', []);


hiiServices.factory('dhis2APIService', function($http){
    

    var serviceFactory={

      gethiiProgramsInfo: function(pnames) {
        var pnames = ['Sanitary Complex hii Program', 'Building hii Program'];
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
        var promise = $http.get('/api/programStages/'+id + '?fields=programStageSections[id,name,programStageDataElements[dataElement[id,name, type,optionSet[options]]]').then(function(response){
          return response.data;
        });
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
      }
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