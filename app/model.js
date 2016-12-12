// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Creates a User Schema
var UserSchema = new Schema({
    location: {type: [Number], required: true}, // [Long, Lat]
    htmlverified: String,
	status: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date}
});

// Sets the created_at parameter equal to the current time
UserSchema.pre('save', function(next){
    now = new Date();
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

// Indexes this schema in 2dsphere format (critical for proximity searches)
UserSchema.index({location: '2dsphere'});

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "users"
module.exports = mongoose.model('user', UserSchema);