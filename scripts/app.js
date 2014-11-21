(function() {
    
    var app = angular.module('infrastructureInventory', ['hiiDirectives',
        'd2Menu',
        'pascalprecht.translate',
        'hiiServices'])

    .config(function($translateProvider) {
        
        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });
        
        $translateProvider.preferredLanguage('en');
    });

})();

