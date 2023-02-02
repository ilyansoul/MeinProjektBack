const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    user_id: {type: String},
    username : {type : String, required: true},
    email : {type : String, required: true},
    password : {type : String, required: true}, // Change data type from Promise to String
    tel : { type : Number},
    imageUrls: {type : String},
    dob_day: { type : Number },
    dob_month: { type : String },
    dob_year: { type : String },
    gender_identity: { type : String },
    gender_interest: { type : String },
    // admin : {type: Boolean}
})
module.exports = mongoose.model('User', userSchema)