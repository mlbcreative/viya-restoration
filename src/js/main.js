
var estates = new Array();
var nodes = new Array();
var island = "";

$(document).ready(function() {

	//maps
	$('.map-option a').on('click', function() {
        
        $('.map-option a').removeClass('active');
        
        $(this).addClass('active');
        
        var location = $(this).data('map');
        
        console.log(location);
        
        $('.node-map').removeClass('active');
        
        $('img[data-mapid="' + location + '"]').addClass('active');
        
        return false;
    })

	$('.hotspot-locations ul li').on('tap click', function(){
		var hotspotId = $(this).data('hotspot');

		$(this).siblings().removeClass('active');
		$(this).addClass('active');

		$('#HotSpots circle').attr({'style' : ''});
		$('#HotSpots_STX circle').attr({'style' : ''});
		$('#HotSpots_STJ circle').attr({'style' : ''});

		if( $('#' + hotspotId).hasClass('stx-cls-12') ){
				$('#' + hotspotId).animate({'r' : '10', 'opacity':0.75}, 500);
			} else {
			
			$('#' + hotspotId).animate({'r' : '10'}, 500).css({'fill' : 'rgba(255,103,27,0.5)'});

		}
	})
    
    
    //auto complete and estate lookup
    
    $('#islandSelect').on('change', function() {
        
       island = $(this).val();
        
        //empty current estate array
        estates.length = 0;
        
        getEstates(island);
        
    })
    
    function getEstates(i) {
        
        var island = i;
        var endpoint = island + "-estates";
        var url = "https://35f3fdg005.execute-api.us-east-1.amazonaws.com/beta/" + endpoint;
        
        //get the data
        $.ajax({
            url : url,
            dataType:'json',
            method : 'GET',
        }).done(function(data) {
            estates = data.estates;
           
            var estateNames = new Array();
            
            for(var i=0;i < estates.length; i++) {
                estateNames.push(estates[i]['estate_name']);
            }
            
            $('#step2').show();
            
            //autocomplete happens here
            //var estateField = $('#estateInput')[0];
            
            var autoComp = new autoComplete({
                selector: 'input[name="estateInput"]',
                minChars: 2,
                source: function(term, suggest){
                    term = term.toLowerCase();
                    var choices = estateNames;
                    var matches = [];
                    for (i=0; i<choices.length; i++)
                        if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
                    suggest(matches);
                },
                onSelect: function(e, term, item){
                    var currentEstate = {};
                    for(var i=0; i < estates.length; i++) {
                        if(estates[i]['estate_name'] == term) {
                            currentEstate = estates[i];
                        }
                    }
                    
                    getNodes(currentEstate);
                }
            });
            
            
            
        }).fail(function(data){
            alert(data);
        })
        //END AJAX 
    }
    
    function getNodes(estate) {
        //console.log(estate);
        //clear the gloabl nodes array
        //assemble the node ids
        var nodeIds = [];
        
        for(var i=0; i < estate.nodes.length; i++) {
            var n = estate.estate_area + estate.nodes[i];
            nodeIds.push(n);
        }
        //stringify the data for the api call
        
        var data = {
            nodes : nodeIds
        }
    
        
        
        
        var endpoint = island + "-estates/nodes";
        var url = "https://35f3fdg005.execute-api.us-east-1.amazonaws.com/beta/" + endpoint;
        
        $.ajax({
            url : url,
            method : 'POST',
            dataType : 'json',
            contentType : 'application/json',
            data :  JSON.stringify(data),
            success : function(data) {
                
                //empty the nodList display
                $('#nodeList').empty();
                
                var selectedNodes = data.nodes;
                var nodeDisplay = "";
                
                for(var i=0; i < selectedNodes.length; i++) {
                    //console.log(selectedNodes[i]);
                    var status = selectedNodes[i].status;
                    nodeDisplay = '<div class="col-12 col-lg-6">'
                    nodeDisplay += '<div class="nodeInfo">';
                    nodeDisplay += '<strong>Node: ' + selectedNodes[i].node_id + '</strong><br />';
                    nodeDisplay += '<strong>Status: </strong>' + status.toUpperCase() + '<br />';
                    nodeDisplay += '<strong>Additional Information: </strong><br />';
                    nodeDisplay += '<p class="body-txt">' + selectedNodes[i].notes + '</p>';
                    nodeDisplay += '<p><a href="#" data-toggle="modal" data-target="#nodeMapModal">View Map</a></p>';
                    nodeDisplay += '</div></div>';
                    
                    $('#step3').show();
                    $('#nodeList').append(nodeDisplay);
                    
                }
                //console.log(nodeDisplay);
                
                
            }
        })
    }

})
