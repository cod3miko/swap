// Declares the initial angular module "swap angular". Module grabs other controllers and services.
var app = angular.module('swap angular', ['checkinCtrl', 'checkoutCtrl', 'headerCtrl', 'geolocation', 'gservice', 'ngRoute'])

    // Configures Angular routing -- showing the relevant view and controller when needed.
    .config(function($routeProvider){

        // Check In Control Panel
        $routeProvider.when('/checkin', {
            controller: 'checkinCtrl',
            templateUrl: 'partials/checkinForm.html',

        // Check Out Control Panel
        }).when('/checkout', {
            controller: 'checkoutCtrl',
            templateUrl: 'partials/checkoutForm.html',

        // All else forward to the Check In Control Panel
        }).otherwise({redirectTo:'/checkin'})
    });
