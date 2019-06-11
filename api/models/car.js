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
    },
    origin : {
        type : String,
        required : true,
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
    },
    distance : {
        type : Number,
        required : false,
    },
    gear : {
        type : String,
        required : true,
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
    }
});

module.exports = mongoose.model("Car", carSchema);