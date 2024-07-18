const mongoose = require("mongoose");
const { string } = require("zod");

mongoose.connect("mongodb://localhost:27017/paytm")

const userSchema = mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        minLength: 3,
        maxLength: 30
    },
    password : {
        type : String,
        required : true,
        minLength : 6
    },
    firstName : {
        type : String,
        required : true,
        trim : true,
        maxLength : 50
    },
    lastName : {
        type : String,
        required : true,
        trim : true,
        maxLength : 50
    }
})

const accountSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId, // Reference to the user model
        ref : 'User',
        required : true 
    },
    balance : {
        type : Number ,
        required : true
    }
})

const Account = mongoose.model('Account', accountSchema)
const User = mongoose.model("User",userSchema);

module.exports = {
    User,
    Account
}