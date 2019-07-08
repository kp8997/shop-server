const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

var carSchema = Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title : {
        type : String,
        required : true,
        index : true,
        text : true,
    },
    brand : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
        index : true,
        text : true,
    },
    origin : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
        index : true,
        text : true,
    },
    year : {
        type : Number,
        reuired : true,
    },
    model : {
        type : String,
        required : true,
        index : true,
        text : true,
    },
    color : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
        index : true,
        text : true,
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

carSchema.index({
    model : 'text',
    title : 'text',
    brand : 'text',
    origin : 'text',
    color : 'text',
}, {
    weight : {
        model : 4,
        title : 5,
        brand : 2,
        origin : 2,
        color : 2
    }
});

carSchema.statics.checkTerm = function(term) {
    const myTerm = term
    try {
        if (!myTerm) {
            return new Promise((resolve, reject) => {
                reject("Term must not be empty");
            });
        }
    } catch (err) {
        console.log(err);
        return new Promise((resolve, reject) => {
            reject("Error with term to search");
        });
    }

    return Promise.resolve(myTerm);
}


module.exports = mongoose.model("Car", carSchema);