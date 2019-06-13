const express = require("express");
const router = express.Router();
const Car = require("../models/car");
const googleStorage = require('@google-cloud/storage');
const multer = require('multer');
const gcsSharp = require('multer-sharp');
const mongoose = require("mongoose");
const checkAuth = require("../middleware/checkAuth");
const User = require("../models/user");
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

// GET ALL CAR WITH OUT PAGINATION - SUCCESS BUT NOT USE ANYMORE
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

// GET DETAIL CAR BY CAR ID - SUCCESS
router.get("/:id", (req, res) => {
    const id = req.params.id;
    Car.findOne({_id : id}).select().exec().then(doc => {
        console.log(doc);
        res.status(200).json({
            message : "get a car successfully",
            car : {
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
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message : "Error in get detail car",
            error : err,
        });
    })
});

// GET CAR BY USER ID - SUCCESS
router.get("/my-car/:userId", (req, res) => {
    const userId = req.params.userId;
    Car.find({author : userId}).select("_id brand origin model price year imagesFilename").exec().then(cars => {
        console.log(cars);
        if (cars.length < 1) {
            res.status(404).json({
                message : "Can not find any car with that id",
            });
        } else {
            const response = {
                count : cars.length,
                cars : cars.map(doc => {
                    return {
                        id : doc._id,
                        brand : doc.brand,
                        origin : doc.origin,
                        year : doc.year,
                        model : doc.model,
                        price : doc.price,
                        imagesFilename : doc.imagesFilename,
                    }
                }),
            }
            res.status(200).json(response);
        }
    }).catch(err => {
        console.log(err);
        res.status(404).json({
            message : "Error in find car by user id",
            error : err,
        })
    })
})

// GET CAR WITH PAGINATION 2 - SUCCESS
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
                        let authorName = "Admin"
                        if (doc.author !== undefined) {
                            console.log(doc.author.name);
                            authorName = doc.author.name;
                        }
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
                            author : authorName
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


//POST CAR - PROTECTED ROUTE - SUCCESS
router.post("/", checkAuth, upload.single('images'), (req, res) => {
    let user = req.user;
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
        const carId = car._id;
        user.cars = user.cars.concat(carId);
        user.save().then(user => {
            res.status(201).json({
                message : "Car and binding User'cars save successfully",
                carId : carId,
                userCarId : user.cars,
            });
        }).catch(err => {
            res.status(500).json({
                message : "Car and binding User failed",
            });
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error : `Car POST has ${err}`
        });
    });
});


// UPDATE FIED BY CAR ID - SUCCESS
router.patch("/:id", (req, res) => {
    const id = req.params.id;
    const ops = {};
    for (var op of Object.keys(req.body)) {
        ops[op] = req.body[op];
    }
    console.log(ops);
    Car.updateOne({_id : id}, { $set : ops}).exec().then(doc => {
        console.log(doc);
        res.status(200).json({
            message : "car updated successfully",
            id : id,
            update : ops,
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message : "Car updated failed in PATCH",
            error : err,
        });
    })
});

module.exports = router;