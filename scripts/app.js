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
        .when('/detail/:complexId',{
            templateUrl:'views/detail-page.html',
            controller: 'detailController',
            controllerAs: 'detailCtrl'
        })
        .when('/settings',{
            templateUrl:'views/settings.html',
            controller: 'settingsController',
            controllerAs: 'settingsCtrl'
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

