//===============================================================================================//
//                                   Mongoose User Schema                                        //
//===============================================================================================//

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

//===============================================================================================//

// Mongoose schema for a user model.
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Allows passport to add a username and password to the User schema.
UserSchema.plugin(passportLocalMongoose);

//===============================================================================================//

module.exports = mongoose.model('User', UserSchema);