// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($rootScope, $http){

        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};

        // Array of locations obtained from API calls
		var heatmapData = [];
		var checkin = false; //sets initial checkin status to false
		
        // Variables we'll use to help us pan to the right spot
        var lastMarker;
        var currentSelectedMarker;

        // Selected Location (initialize to center of New Haven CT)
        var selectedLat = 41.31;
        var selectedLong = -72.92;

        // Handling Clicks and location selection
        googleMapService.clickLat  = 0;
        googleMapService.clickLong = 0;

        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Function will take new latitude and longitude coordinates.
        googleMapService.refresh = function(latitude, longitude){

            // Clears the holding array of locations
            locations = [];
			heatmapData = [];
            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;
			
			//sets initial checkin status to false
			checkin = false;
			
            // Perform an AJAX call to get all of the records in the db.
            $http.post('/clusters',{lat:latitude,lon:longitude}).success(function(response){
				
                // Convert the results into Google Map Format using private inner functions
				heatmapData = heatmap(response);
				
                // Then initialize the map.
                initialize(latitude, longitude);
            }).error(function(){});
        };
		
		// Refresh the Map only with checked-in data
		googleMapService.checkin = function(latitude, longitude){
			//Obtain coordinates of newly created user
			$http.get('/users').success(function(response){
				temp = (response[response.length-1]);
				
				//Sets checkin status to true
				checkin = true;
				
                // Then initialize the map.
                initialize(latitude, longitude);
				
			}).error(function(){});
		};

        // Private Inner Functions
        // --------------------------------------------------------------
        // Convert a JSON of users into map points
		
		var heatmap = function(response){
			
			// Clear the heatmapData holder
			var heatmapData = [];
			
			// Loop through all of the JSON entries in the response
			for (var i = 0; i < response.length; i++){
				
				heatmapData[i] = [];
				
				for (var j = 0; j < response[i].elements.length; j++){
					
					// Converts each of the JSON records into Google Maps Location format
					var user = response[i].elements[j];
					var latlon = new google.maps.LatLng(user.location[0], user.location[1]);
					heatmapData[i].push({latlon,
										status: user.status,
										htmlverified: user.htmlverified,
										created_at: user.created_at,
										updated_at: user.updated_at});
				}
			}
			// heatmapData is now an array populated with records in Google Maps format
			return heatmapData;
		}

		// Initializes the map
		var initialize = function(latitude, longitude) {

			// Uses the selected lat, long as starting point
			var myLatLng = {lat: selectedLat, lng: selectedLong};

			// If map has not been created already...
			if (!map){

				// Create a new map and place in the index.html page
				var map = new google.maps.Map(document.getElementById('map'), {
					zoom: 20,
					center: myLatLng,
					disableDefaultUI: true,
					styles: [{"elementType": "geometry","stylers": [{"color": "#f5f5f5"}]},
						 {"elementType": "labels.icon","stylers": [{"visibility": "off"}]},
						 {"elementType": "labels.text.fill","stylers": [{"color": "#616161"}]},
						 {"elementType": "labels.text.stroke","stylers": [{"color": "#f5f5f5"}]},
						 {"featureType": "administrative.land_parcel","elementType": "labels.text.fill","stylers": [{"color": "#bdbdbd"}]},
						 {"featureType": "poi","elementType": "geometry","stylers": [{"color": "#eeeeee"}]},
						 {"featureType": "poi","elementType": "labels.text.fill","stylers": [{"color": "#757575"}]},
						 {"featureType": "poi.park","elementType": "geometry","stylers": [{"color": "#e5e5e5"}]},
						 {"featureType": "poi.park","elementType": "labels.text.fill","stylers": [{"color": "#9e9e9e"}]},
						 {"featureType": "road","elementType": "geometry","stylers": [{"color": "#ffffff"}]},
						 {"featureType": "road.arterial","elementType": "labels.text.fill","stylers": [{"color": "#757575"}]},
						 {"featureType": "road.highway","elementType": "geometry","stylers": [{"color": "#dadada"}]},
						 {"featureType": "road.highway","elementType": "labels.text.fill","stylers": [{"color": "#616161"}]},
						 {"featureType": "road.local","elementType": "labels.text.fill","stylers": [{"color": "#9e9e9e"}]},
						 {"featureType": "transit.line","elementType": "geometry","stylers": [{"color": "#e5e5e5"}]},
						 {"featureType": "transit.station","elementType": "geometry","stylers": [{"color": "#eeeeee"}]},
						 {"featureType": "water","elementType": "geometry","stylers": [{"color": "#c9c9c9"}]},
						 {"featureType": "water","elementType": "labels.text.fill","stylers": [{"color": "#9e9e9e"}]}]
				});
			}	
			
			//Visualize Heatmap Data
			for (var i = 0; i < heatmapData.length; i++){
				
				//Method to find % or chance of finding parking in a given centroid (and centroid will contain heatmapData)
				var centroid = [];
				var notparked = 0;
				
				//Giving a timeframe for cars parked within the past 6 Hours
				var time = new Date();
				time.setDate(time.getUTCDate()-0.25); //6 HOURS AGO
				var now = time.toISOString(); 
				
				for (var j = 0; j < heatmapData[i].length; j++){
					if(heatmapData[i][j].created_at > now && heatmapData[i][j].htmlverified == "Verified"){ // TIMEFRAME and VERIFICATION IMPLEMENTATION
						centroid.push(heatmapData[i][j].latlon);
						
						if(heatmapData[i][j].status == "Not Parked"){
							notparked++;
						}
					}
				}

				if(notparked/heatmapData[i].length >= 0.80){
					// Heatmap for coordinates
					var heatmap = new google.maps.visualization.HeatmapLayer({
						data: centroid,
						dissipating: true,
						gradient:  [//GREEN
									'rgba(  0, 150,   0, 0)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
								],
						radius: 50, //The radius of influence for each data point, in pixels.
						opacity: 0.1, //between 0-1 default 0.6
						map: map
					});
				}
				if(notparked/heatmapData[i].length >= 0.60 && notparked/heatmapData[i].length < 0.80){
					// Heatmap for coordinates
					var heatmap = new google.maps.visualization.HeatmapLayer({
						data: centroid,
						dissipating: true,
						gradient:  [//GREEN
									'rgba(  0, 150,   0, 0)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
									'rgba(  0, 150,   0, 1)',
								],
						radius: 50, //The radius of influence for each data point, in pixels.
						opacity: 0.3, //between 0-1 default 0.6
						map: map
					});
				}
				if(notparked/heatmapData[i].length >= 0.40 && notparked/heatmapData[i].length < 0.60){
					// Heatmap for coordinates
					var heatmap = new google.maps.visualization.HeatmapLayer({
						data: centroid,
						dissipating: true,
						gradient:  [//YELLOW
									'rgba(255, 255,   0, 0)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)',
									'rgba(255, 255,   0, 1)'
								],
						radius: 50,
						opacity: 0.2,
						map: map
					});
				}
				if(notparked/heatmapData[i].length >= 0.20 && notparked/heatmapData[i].length < 0.40){
					// Heatmap for coordinates
					var heatmap = new google.maps.visualization.HeatmapLayer({
						data: centroid,
						dissipating: true,
						gradient:  [ //RED
									'rgba(  255, 0,   0, 0)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
								],
						radius: 50,
						opacity: 0.1,
						map: map
					});
				}
				if(notparked/heatmapData[i].length < 0.20){
					// Heatmap for coordinates
					var heatmap = new google.maps.visualization.HeatmapLayer({
						data: centroid,
						dissipating: true,
						gradient:  [ //RED
									'rgba(  255, 0,   0, 0)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
									'rgba(  255, 0,   0, 1)',
								],
						radius: 50,
						opacity: 0.3,
						map: map
					});
				}				
			}

			// Set initial location as a bouncing red marker
			var initialLocation = new google.maps.LatLng(latitude, longitude);
			if (checkin == true){
				var marker = new google.maps.Marker({
					position: initialLocation,
					map: map,
					icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
				});
			} else {
				var marker = new google.maps.Marker({
					position: initialLocation,
					animation: google.maps.Animation.BOUNCE,
					map: map,
					icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
				});
			}


			// Function for moving to a selected location
			map.panTo(new google.maps.LatLng(latitude, longitude));
			
		};

		// Refresh the page upon window load. Use the initial latitude and longitude
		google.maps.event.addDomListener(window, 'load',
			googleMapService.refresh(selectedLat, selectedLong));
		
		return googleMapService;
	});