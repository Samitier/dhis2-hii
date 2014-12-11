var hiiServices = angular.module('hiiServices', []);


hiiServices.factory('dhis2APIService', function($http){
    

    var serviceFactory={

      getProgramId : function (name) {
        var promise = $http.get('/api/programs.json').then(function(response){
          for(var i=0; i<response.data.programs.length;++i) {
              if(response.data.programs[i].name == name) return (response.data.programs[i].id);
          }
        });
        return promise;
      },

      getProgramData : function(id) {
        var promise = $http.get('/api/programs/'+id).then(function(response){
          return response.data;
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

      updateTEIInfromCopy : function(id,message){
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

      getTrackedEntityById : function (id) {
        var promise = $http.get('/api/trackedEntityInstances/'+id).then(function(response){
          return response.data;
        });
        return promise;
      },

      getTrackedEntityId : function(te){
        var promise = $http.get('/api/trackedEntities').then(function(response){
          for(var i=0; i<response.data.trackedEntities.length;++i) {
            if(response.data.trackedEntities[i].name == te) return response.data.trackedEntities[i].id;
          }
          return 0;
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

      getProgramStageId: function (name) {
        var promise = $http.get('/api/programStages').then(function(response){
          for(var i=0; i<response.data.programStages.length; ++i) {
            if(response.data.programStages[i].name == name) return response.data.programStages[i].id;
          }
          return null;
        });
        return promise;
      },
      getProgramStage: function (id) {
        var promise = $http.get('/api/programStages/'+id + '?fields=programStageSections[id,name,programStageDataElements[dataElement[id,name]]]').then(function(response){
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

