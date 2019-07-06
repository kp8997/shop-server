const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

const carSchema = Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title : {
        type : String,
        required : true,
    },
    brand : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    origin : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    year : {
        type : Number,
        reuired : true,
    },
    model : {
        type : String,
        required : true,
    },
    color : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
    },
    distance : {
        type : Number,
        required : false,
    },
    gear : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    price : {
        type : Number,
        required : true,
    },
    imagesPath : {
        type : [String],
        required : false
    },
    imagesFilename : {
        type : [String],
        required : false
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : false
    },
    createAt : {
        type : Date,
        default : Date.now(),
    },
    isNewCar : {
        type : Boolean,
        required : true,
        default : false
    }
});

module.exports = mongoose.model("Car", carSchema);