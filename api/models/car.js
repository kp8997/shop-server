const mongoose = require("mongoose");


const carSchema = mongoose.Schema({
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
        required : false,
    },
    price : {
        type : Number,
        required : true,
    },
    imagesPath : {
        type : [String],
        require : false
    },
    imagesFilename : {
        type : [String],
        require : false
    }
});

module.exports = mongoose.model("Car", carSchema);