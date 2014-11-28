(function() {
    
    var app = angular.module('infrastructureInventory', ['hiiDirectives',
        'hiiControllers',
        'ngRoute',
        'd2Menu',
        'pascalprecht.translate',
        'hiiServices'])

    .config(function($translateProvider, $routeProvider) {
        
        $routeProvider.when('/list', {
            templateUrl:'views/list-page.html',
            controller: 'listController',
            controllerAs: 'listCtrl'
        })
        .when('/settings',{
            templateUrl:'views/settings-page.html',
            controller: 'settingsController',
            controllerAs: 'settingsCtrl'
        })
        .when('/basicInfo/:complexId',{
            templateUrl:'views/basic-info-page.html',
            controller: 'basicInfoController',
            controllerAs: 'basicInfoCtrl'
        })
        .when('/addBasicInfo/:complexId',{
            templateUrl:'views/basic-info-page.html',
            controller: 'addBasicInfoController',
            controllerAs: 'addBasicInfoCtrl'
        })
        .when('/reports/:complexId',{
            templateUrl:'views/reports-page.html',
            controller: 'reportsController',
            controllerAs: 'reportsCtrl'
        })
        .when('/buildings/:complexId',{
            templateUrl:'views/buildings-page.html',
            controller: 'buildingsController',
            controllerAs: 'buildingsCtrl'
        })
        .otherwise({
            redirectTo : '/list'
        });  

        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });
        
        $translateProvider.preferredLanguage('en');
    });

})();

