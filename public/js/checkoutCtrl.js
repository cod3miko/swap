// Creates the checkoutCtrl Module and Controller. Note that it depends on 'geolocation' and 'gservice' modules.
var checkoutCtrl = angular.module('checkoutCtrl', ['geolocation', 'gservice']);
checkoutCtrl.controller('checkoutCtrl', function($scope, $log, $http, $rootScope, geolocation, gservice){

    $scope.formData = {};

	//Obtain ID of newly created user
	$http.get('/users').success(function(response){
		userid = (response[response.length-1]._id);

		//Display Checked In info in form
		$scope.formData.latitude = response[response.length-1].location[1];
        $scope.formData.longitude = response[response.length-1].location[0];
        $scope.formData.htmlverified = response[response.length-1].htmlverified;
		
		// Change user from parked to not parked
		$scope.removeUser = function(){
			$scope.status = "Not Parked";
			// Grabs all of the text box fields
			var userData = {
				status: $scope.status,
				updated_at: new Date()
			};
			// Updates the user status to Not Parked
			$http.put('/users/' + userid, userData)
				.success(function (data) {
					// Refresh the map with new data
					gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
					window.location = "#/checkin";
				})
				.error(function (data) {
					console.log('Error: ' + data);
				});
		};
		
	}).error(function(){});

});

