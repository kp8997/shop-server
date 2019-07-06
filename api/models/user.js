const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Car = require('./car');
const Schema = mongoose.Schema;

const userSchema = Schema({
    _id : mongoose.Schema.Types.ObjectId,
    email : {
        type : String,
        required : true,
        match : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    name : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
    createAt : {
        type : Date,
        default : Date.now(),
    },
    avatar : {
        type : [String],
        required : false,
    },
    phone : {
        type : Number,
        reuired : true,
    },
    cars : {
        type : [Schema.Types.ObjectId],
        ref : "Car",
        required : false
    },
    tokens : [{
        token : {
            type : String,
            required : true,
        },
        access : {
            type : String,
            required : true,
        }
    }]
});


userSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = "auth";
    let token = jwt.sign({
        _id : user._id,
        email : user.email,
        access
    }, process.env.JWT_KEY || 'secret', {
        expiresIn: "40m",
        algorithm: "HS384",
    });
    // console.log(token);
    user.tokens = user.tokens.concat([{access, token}]);
    return user.save().then(() => {
        return token;
    });
}

userSchema.methods.comparePassword = function(password) {
    var user = this;
    return bcrypt.compareSync(password, this.password)
}

userSchema.methods.removeToken = function(token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};

userSchema.methods.checkCar = function(paramId) {
    let user = this;
    let carId;
    try 
    {
        carId = user.cars.find(car => {
            return car == paramId;
        });

        console.log(carId);
        if (carId == undefined) {
            return new Promise((resolve, reject) => {
                reject("That user don't own that car");
            });
        }
    } catch (err) {
        console.log(err);
        return new Promise((resolve, reject) => {
            reject("Error when find carId");
        });
    }
    return Promise.resolve(carId);
}

userSchema.statics.findByToken = function(token) {
    const user = this;
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_KEY || 'secret');
    } catch (err) {
        console.log(err);
        return new Promise((resolve, reject) => {
            reject();
        });
    }

    return user.findOne({
        "_id" : decoded._id,
        "tokens.token" : token,
        "tokens.access" : "auth"
    });
    
}   

module.exports = mongoose.model("User", userSchema);