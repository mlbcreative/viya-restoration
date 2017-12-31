
$(document).ready(function(){

	//maps
	$('.map-options li a').on('tap click', function(e){
		var map = $(this).data('map');

		//hide all maps
		$('.map').removeClass('active');
		$('.map-options li a').removeClass('active');
		//find and show the selected map
		$newMap = $('#' + map + '-wifi-map').addClass('active');
		$(this).addClass('active');



		return false;
	})
	
	$('.node-map-options li a').on('tap click', function(e){
		var map = $(this).data('map');

		//hide all maps
		$('.node-map').removeClass('active');
		$('.node-map-options li a').removeClass('active');
		//find and show the selected map
		$newMap = $('#' + map + '-node-map').addClass('active');
		$(this).addClass('active');



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

})

