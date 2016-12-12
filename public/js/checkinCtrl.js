// Creates the checkinCtrl Module and Controller. Note that it depends on the 'geolocation' and 'gservice' modules and controllers.
var checkinCtrl = angular.module('checkinCtrl', ['geolocation', 'gservice']);
checkinCtrl.controller('checkinCtrl', function($scope, $http, $rootScope, geolocation, gservice){

    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;

    // Set initial coordinates to the center of New Haven CT
    $scope.formData.latitude = 41.310;
    $scope.formData.longitude = -72.929;

    geolocation.getLocation().then(function(data){

        // Set the latitude and longitude equal to the HTML5 coordinates
        coords = {lat:data.coords.latitude, long:data.coords.longitude};

        // Display coordinates in location textboxes rounded to six decimal points
        $scope.formData.longitude = parseFloat(coords.long).toFixed(6);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(6);

        // Display message confirming that the coordinates verified.
        $scope.formData.htmlverified = "Verified";

        gservice.refresh($scope.formData.latitude, $scope.formData.longitude);

    });

    // Functions
    // ----------------------------------------------------------------------------
	// Function for refreshing the HTML5 verified location (used by refresh button)
    $scope.refreshLoc = function(){
        geolocation.getLocation().then(function(data){
            coords = {lat:data.coords.latitude, long:data.coords.longitude};

            $scope.formData.longitude = parseFloat(coords.long).toFixed(6);
            $scope.formData.latitude = parseFloat(coords.lat).toFixed(6);
            $scope.formData.htmlverified = "Verified";
            gservice.refresh(coords.lat, coords.long);
        });
    };
	
    // Creates a new user based on the form fields
    $scope.createUser = function() {
		$scope.status = "Parked";
        // Grabs all of the text box fields
        var userData = {
            location: [$scope.formData.longitude, $scope.formData.latitude],
            htmlverified: $scope.formData.htmlverified,
			status: $scope.status
        };
		
        // Saves the user data to the db
        $http.post('/users', userData)
            .success(function (data) {
				
				window.location = "#/checkout";
								
                // Refresh the map with new data
                gservice.checkin($scope.formData.latitude, $scope.formData.longitude);
				
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };
});