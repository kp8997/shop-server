const User = require("../models/user");
const express = require('express');
const router = express.Router();
const multer = require('multer');
const gcsSharp = require('multer-sharp');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const bucket = "gs://mystorage-e3329.appspot.com/";


const myStorage = gcsSharp({
    projectId : "mystorage-e3329",
    keyFilename : process.env.KEYPATH,
    bucket : bucket,
    destination: 'userimages',
});

const myFileFilter = function(req, file, cb) {
    // warning filter : do not use when it's unnessesary
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const myLimit = {
    fileSize: 1024 * 1024 * 10,
};

const upload = multer({
    storage: myStorage,
    fileFilter: myFileFilter,
    limits: myLimit,
});

router.get("/", (req,res) => {
    User.find().then(docs => {
        res.status(200).json({
            count : docs.length,
            users : docs
        });
    }).catch(err => { 
        console.log(err); 
        res.status(500).json({
        error : err
    })});
})


router.post("/", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err)
        {
            console.log(err);
        }
        if (hash) {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email : req.body.email,
                password : req.body.password,
                name : req.body.name,
                phone : req.body.phone
            });
            user.save().then(user => {
                res.status(200).json({
                    message : "user save successfully"
                });
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    error : `user has error ${err}`
                });
            });
        }
    });
    
});

module.exports = router;