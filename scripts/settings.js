$( document ).ready(function() {
    
    var installed = false;
    var info;
    $.ajax({
        url: "/api/trackedEntities/",
        type: 'GET'
    }).done(function(response) { 
        for(var i=0; i<response.trackedEntities.length && !installed; ++i) {
            installed = ((response.trackedEntities[0].name == 'Building') || (response.trackedEntities[0].name == 'Urbanization'));
        }

        if(installed) {
            $('#pSettings').html('You have correctly installed the metadata');
            $( '#buttonInstall' ).attr("disabled", true);
        }
    });

    $( '#buttonInstall' ).click(function( event ) {
        
        //OPTION SETS//
        $.getJSON('metadata/optionSets.json', function(json) {          
            sendOptionSet(0,json);
        });

        var sendOptionSet = function(i,json) {
            var opSet = {name:json.optionSets[i].name, options:json.optionSets[i].options};
            $.ajax({
                url: "/api/optionSets/",
                type: 'POST',
                data: JSON.stringify(opSet),
                contentType: 'application/json;',
                dataType: 'json',
                success: function(response) {
                    ++i;
                    console.log(response);
                    if(i<json.optionSets.length) sendOptionSet(i, json);
                    else readTrackedEntities();
                },
                error: function(response) {
                    console.log(response);
                }
            });
        }

        //TRACKED ENTITIES//
        var readTrackedEntities =function() {
            $.getJSON('metadata/trackedEntities.json', function(json) {
                sendTrackedEntities(0,json);
            });
        }
        var sendTrackedEntities = function(i, json) {
            var trkdEnt = {name:json.trackedEntities[i].name, description:json.trackedEntities[i].description};
            $.ajax({
                url: "/api/trackedEntities/",
                type: 'POST',
                data: JSON.stringify(trkdEnt),
                contentType: 'application/json;',
                dataType: 'json',
                success: function(response) {
                    ++i;
                    console.log(response);
                    if(i<json.trackedEntities.length) sendTrackedEntities(i, json);
                    else readRelationshipType();
                },
                error: function(response) {
                    console.log(response);
                }
            });
        }

        //RELATIONSHIP TYPE//
        var readRelationshipType =function() {
            $.getJSON('metadata/relationshipType.json', function(json) {
                sendRelationshipType(0,json);
            });
        }
        var sendRelationshipType = function(i, json) {
            var rel = {name:json.relationshipTypes[i].name, aIsToB:json.relationshipTypes[i].aIsToB,
            bIsToA:json.relationshipTypes[i].bIsToA};
            $.ajax({
                url: "/api/relationshipTypes/",
                type: 'POST',
                data: JSON.stringify(rel),
                contentType: 'application/json;',
                dataType: 'json',
                success: function(response) {
                    ++i;
                    console.log(response);
                    if(i<json.relationshipTypes.length) sendRelationshipType(i, json);
                    //else readTrackedEntityAttr();
                    else {
                        alert("Instalation finished.");
                        $('#pSettings').html('You have correctly installed the metadata');
                        $( '#buttonInstall' ).attr("disabled", true);
                    }

                },
                error: function(response) {
                    console.log(response);
                }
            });
        }


        //TRACKED ENTITY ATTRIBUTES
        var readTrackedEntityAttr =function() {
            $.getJSON('metadata/trackedEntityAttributes.json', function(json) {
                sendTrackedEntityAttr(0,json);
            });
        }
        var sendTrackedEntityAttr = function(i, json) {
            var trkdEnt = {name:json.trackedEntityAttributes[i].name+"a", description:json.trackedEntities[i].description,
            trackedEntityAttributes:[]};
            $.ajax({
                url: "/api/trackedEntityAttributeGroups/",
                type: 'POST',
                data: JSON.stringify(trkdEnt),
                contentType: 'application/json;',
                dataType: 'json',
                success: function(response) {
                    ++i;
                    console.log(response);
                    if(i<json.trackedEntities.length) sendTrackedEntities(i, json);
                },
                error: function(response) {
                    console.log(response);
                }
            });
        }
    });
});



