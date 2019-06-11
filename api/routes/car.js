const express = require("express");
const router = express.Router();
const Car = require("../models/car");
const googleStorage = require('@google-cloud/storage');
const multer = require('multer');
const gcsSharp = require('multer-sharp');
const mongoose = require("mongoose");
const checkAuth = require("../middleware/checkAuth");
require ('custom-env').env('staging');
// const firebase = require('firebase');
// const storage = firebase.storage();
// const storageRef = storage.ref();

//const bucket = googleStorage.bucket("gs://mystorage-e3329.appspot.com/");
const bucket = "gs://mystorage-e3329.appspot.com/"
const myStorage = gcsSharp({
    projectId : "mystorage-e3329",
    keyFilename : process.env.KEYPATH,
    bucket : bucket,
    destination: 'images',
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

router.get("/", (req, res) => {
    // list of image on firebase storage
    //const imagesRef = storageRef.child('images');
    Car.find().select().exec().then(docs =>{
        //console.log(docs);
        const response = {
            count : docs.length,
            cars : docs.map(doc => {
                //const image = imagesRef.child(`${doc.imagesFilename + '.jpg'} `);
                return {
                    id : doc._id,
                    title : doc.title,
                    brand : doc.brand,
                    origin : doc.origin,
                    year : doc.year,
                    model : doc.model,
                    color : doc.color,
                    distance : doc.distance,
                    gear : doc.gear,
                    price : doc.price,
                    imagesFilename : doc.imagesFilename,
                }
            })
        };
        res.status(200).json(response);
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            message: "ERROR IN GET ALL CAR",
            error : err
        });
    });
});


router.get("/:indexPage" , (req, res) => {
    const indexPage = req.params.indexPage;
    Car.find().populate('author').select().skip(indexPage * 2).limit(2).exec().then(docs => {
        //console.log(docs);
        Car.countDocuments({}, (err, count) => {
            if (err) {
                console.log(err);
            } else {
                console.log(count);
                const response = {
                    count : count,
                    cars : docs.map(doc => {
                        let author = "Admin"
                        // if (typeof doc.author.name !== undefined) {
                        //     // author = doc.author.name;
                        //     console.log(doc.author.name);
                        //     author = doc.author.name;
                        // }
                        return {
                            id : doc._id,
                            title : doc.title,
                            brand : doc.brand,
                            origin : doc.origin,
                            year : doc.year,
                            model : doc.model,
                            color : doc.color,
                            distance : doc.distance,
                            gear : doc.gear,
                            price : doc.price,
                            imagesFilename : doc.imagesFilename,
                            author : author,
                        }
                    })
                };
                res.status(200).json(response);
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message : "ERROR IN GET PAGINATION",
            error : err
        });

    });
});

router.post("/", checkAuth, upload.single('images'), (req, res) => {
    const car = new Car({
        _id: new mongoose.Types.ObjectId(),
        title : req.body.title,
        brand : req.body.brand,
        origin : req.body.origin,
        year : req.body.year,
        model : req.body.model,
        color : req.body.color,
        distance : req.body.distance,
        gear : req.body.gear,
        price : req.body.price,
        imagesPath : req.file.path,
        imagesFilename : req.file.filename,
        author : req.user._id
    });
    car.save().then(car => {
        if (!req.file) {
            res.status(404).json({
                message : "File not found, please upload a file"
            });
        }
        res.status(201).json({
            message : "Car Save successfully"
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error : `Car POST has ${err}`
        });
    });
});

module.exports = router;