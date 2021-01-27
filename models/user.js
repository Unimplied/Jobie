const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    applications: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Application'
        }
    ],
    isVerified: Boolean,
    emailToken: String,
});

UserSchema.plugin(passportLocalMongoose); // Passport adds on username, password, ensures uniqueness of usernames

module.exports = mongoose.model('User', UserSchema);