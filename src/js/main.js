
var estates = new Array();
var nodes = new Array();
var island = "";

$(document).ready(function() {
    //initiate map zooms
    
	//maps
	$('.map-option a').on('click', function() {
        
        $('.map-option a').removeClass('active');
        
        $(this).addClass('active');
        
        var location = $(this).data('map-target');
        
        console.log(location);
        
        $('.wifi-map').removeClass('active');
        $('div[data-wifi-locations]').removeClass('active');
        
        $('.wifi-map[data-map="' + location + '"]').addClass('active');
        $('div[data-wifi-locations="' + location + '"]').addClass('active');
        
        
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
       
        $('#stjMessage').hide();
        $('#step2').show();
       island = $(this).val();
        
        //empty current estate array
        estates.length = 0;
        
        if(island == "stj") {
            $('#step2').hide();
            $('#stjMessage').show();
            estates.length = 0;
            return;
        } else {
            getEstates(island);
        }
        
        
        
    })
    
    function getEstates(i) {
        
        island = i;
        var url = "https://35f3fdg005.execute-api.us-east-1.amazonaws.com/beta/estates?island=" + island;
        
        //get the data
        $.ajax({
            url : url,
            dataType:'json',
            method : 'GET',
        }).done(function(data) {
            //clear array
            estates = [];
            
            estates = data.estates;
           
            var estateNames = new Array();
            
            for(var i=0;i < estates.length; i++) {
                estateNames.push(estates[i]['estate_name']);
            }
            
            $('#step2').addClass('active');
            
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
            island : island,
            nodes : nodeIds
        }
    
        var url = "https://35f3fdg005.execute-api.us-east-1.amazonaws.com/beta/estates/nodes";
        
        $.ajax({
            url : url,
            method : 'POST',
            dataType : 'json',
            contentType : 'application/json',
            data :  JSON.stringify(data),
            success : function(data) {
                
                //empty the nodList display
                $('#nodeList').empty();
                //vars
                var selectedNodes = data.nodes;
                var nodeDisplay = "";
                

                for(var i=0; i < selectedNodes.length; i++) {
                    
                    console.log(i.toString());
                    var status = selectedNodes[i].status;
                    var imgThumbUrl = 'img/' + island.toUpperCase() + '-80.jpg';
                    var imgOriginUrl = 'img/' + island.toUpperCase() + '@2x-80.jpg';
                    var islandImg = new Image();
                    
                    nodeDisplay = '<div class="col-12 col-md-6 col-lg-3">'
                    nodeDisplay += '<div class="nodeInfo">';
                    nodeDisplay += '<strong>Node: ' + selectedNodes[i].node_id + '</strong><br />';
                    nodeDisplay += '<strong>Status: </strong>' + status.toUpperCase() + '<br />';
                    nodeDisplay += '<strong>Additional Information: </strong><br />';
                    nodeDisplay += '<p class="body-txt">' + selectedNodes[i].notes + '</p>';
                    nodeDisplay += '<p>View Map<br /><a href="' + imgOriginUrl + '" id="islandImg_' + i.toString() + '">';
                    
                    nodeDisplay += '</a></p>';
                    nodeDisplay += '</div></div>';
                    
                    $('#step3').show();
                    
                    $('#nodeList').append(nodeDisplay);
                    
                    var imgTarget = document.getElementById('islandImg_' + i.toString());
                    var image = document.createElement("img");
                    image.setAttribute("data-action", "zoom");
                    image.setAttribute("class", "zoomable");
                    image.setAttribute("src", imgThumbUrl);
                    imgTarget.appendChild(image);
                    
                }
                
                
                var zooming = new Zooming({
                    bgColor : 'rgba(255,255,255,0.9)',
                    onBeforeOpen : function() {
                      //$('.zoomable').show();  
                    },
                    onBeforeClose : function() {
                        $('#nodeMapModal').modal('hide');
                    }
                });
                zooming.listen('.zoomable');
                
                //console.log(nodeDisplay);
                
                
            }
        })
    }

})
