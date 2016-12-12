// Dependencies
var mongoose        = require('mongoose');
var User            = require('./model.js');
var geocluster		= require('geocluster');

// Opens App Routes
module.exports = function(app) {

    // GET Routes
    // --------------------------------------------------------
	app.get('/users', function(req, res){
		
		// Opens a generic Mongoose Query
		var query = User.find({});

        query.exec(function(err, users){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of all users
            res.json(users);
        });
    });
	
    // POST Routes
    // --------------------------------------------------------
    // Provides method for saving new users in the db
    app.post('/users', function(req, res){

        // Creates a new User based on the Mongoose schema and the post body
        var newuser = new User(req.body);

        // New User is saved in the db.
        newuser.save(function(err){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of the new user
            res.json(req.body);
        });
    });
	
	// Retrieves JSON records for all users in close proximity to User and implements kMeans clustering
    app.post('/clusters', function(req, res){
				
		// Opens a generic Mongoose Query
		var query = User.find({});
		
		// Grab all of the query parameters from the body.
		var lat = req.param("lat");
		var lon = req.param("lon");
		
		// Using MongoDB's geospatial querying features. (Note original mongoDB coordinates are set [long, lat]
 		query = query.where('location').near({ center: {type: 'Point', coordinates: [lon, lat]},
			
			maxDistance: 0.5 * 1609.34, // in a span of 1/2 MILE
			spherical: true //Specifying spherical geometry (for globe)
			});  
		
        query.exec(function(err, users){
            if(err)
                res.send(err);
			
			//GeoClustering Method
			//-------------------------------------------------
			//Array to hold [lon,lat] pairs
			var coordinates = [];
			users.forEach(function(n, i){
				coordinates.push(users[i].location);
			});
			
			//Swap coordinates array to hold [lat,lon] instead of [lon,lat]
			coordinates.forEach(function(n, i){
				var temp = coordinates[i][0];
				coordinates[i][0] = coordinates[i][1];
				coordinates[i][1] = temp;
			});
			
			/* coordinates = [
				[41.196669,-73.092495],
				[41.196696,-73.092433],
				[41.196299,-73.092406],
				[41.196218,-73.091891],
				[41.196121,-73.093221],
				[41.19625,-73.091204],
				[41.196105,-73.094037],
				[41.196266,-73.090646],
				[41.196153,-73.094637],
				[41.19688,-73.09026],
				[41.195992,-73.089874],
				[41.195782,-73.089616]
			] */
			
			//Multiply stdev with this factor, the smaller the more clusters
			var bias = 1.5; 

			//Result is an array of cluster objects with `centroid` and `elements` properties
			var result = geocluster(coordinates, bias);
			
			//Triple nested forloop purposed to match the geocluster result with User details
			for (var i = 0; i < result.length; i++){
				for (var j = 0; j < result[i].elements.length; j++){
					for (var k = 0; k < coordinates.length; k++){
						if(coordinates[k] == result[i].elements[j]){
							result[i].elements[j] = users[k];
						}
					}
				}
			}

          /*users.forEach(function(n, i){
				users.push(result[i]);
			}); */
			
			// If no errors are found, it responds with a JSON geoclustered users
            res.json(result);
        });
	});
	
	// PUT Routes
    // --------------------------------------------------------
	// Provides method for updating user status in the db
    app.put('/users/:objID', function(req, res){
        var objID = req.params.objID;
        var update = req.body;

        User.findByIdAndUpdate(objID, update, function(err, user){
            if(err)
                res.send(err);
            else
                res.json(req.body);
        });
    });
	
	// DELETE Routes
    // --------------------------------------------------------
    // Delete a User off the Map based on objID
    app.delete('/users/:objID', function(req, res){
        var objID = req.params.objID;
        var update = req.body;

        User.findByIdAndRemove(objID, update, function(err, user){
            if(err)
                res.send(err);
            else
                res.json(req.body);
        });
    });
};  