var hiiServices = angular.module('hiiServices', []);


hiiServices.factory('dhis2APIService', function($http){
    

    var serviceFactory={};

    serviceFactory.getProgramId = function (name) {
      var promise = $http.get('/api/programs.json').then(function(response){
        for(var i=0; i<response.data.programs.length;++i) {
            if(response.data.programs[i].name == name) return (response.data.programs[i].id);
        }
      });
      return promise;
    };

    serviceFactory.getTrackedEntitiesByProgram = function(programId) {
      var promise  = $http.get('/api/trackedEntityInstances.json?ouMode=ALL&program='+ programId).then(function(response){
        var info = {tableHeaders:response.data.headers,tableContents:response.data.rows};
        return info;
      });
      return promise;
    };

    serviceFactory.updateComplexInfo = function(id,message){
      var promise = $http.put('/api/trackedEntityInstances/'+id, JSON.stringify(message)).then(function(response){
        if(response.data.status =="SUCCESS") return true;
        else if(response.data.status == "ERROR") return false;
      });
      return promise;
    };

    serviceFactory.getUserUiLocale = function(){
      var promise = $http.get('/api/me/profile').then(function(response){
        if(response.data.settings.keyUiLocale == null) return 'en';
        else return response.data.settings.keyUiLocale;
      });
      return promise;
    };

    serviceFactory.getTrackedEntityById =function (id) {
      var promise = $http.get('/api/trackedEntityInstances/'+id).then(function(response){
        return response.data;
      });
      return promise;
    };

    return serviceFactory;
  });