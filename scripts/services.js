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

      getTrackedEntitiesByProgram : function(programId, orgunit) {
        var promise  = $http.get('/api/trackedEntityInstances.json?ou=' + orgunit.substr(1,orgunit.length-2) 
          + '&ouMode=SELECTED&program='+ programId).then(function(response){
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

      updateTEIInfo : function(id,message){
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
  };

  return serviceFactory;
});

