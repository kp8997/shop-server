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
const checkAuth = require("../middleware/checkAuth");
const Car = require("../models/car");
const myStorage = gcsSharp({
    projectId: "mystorage-e3329",
    keyFilename: process.env.KEYPATH,
    bucket: bucket,
    destination: 'userimages',
});

const myFileFilter = function (req, file, cb) {
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

router.post("/image", checkAuth, upload.single('images'), (req, res) => {
    const user = req.user;
    const fileName = req.file.filename;
    if (user) {
        if (fileName !== undefined) {
            user.avatar = fileName;
            user.save().then(doc => {
                res.status(200).json({
                    message: "Set avatar success",
                    image: doc.avatar
                });
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    message: "Set avatar failed",
                    error: err
                });
            })

        }
    } else {
        res.status(408).json({
            message: "Time out in post user image - it took too long"
        });
    }
});

//SUCCESS BUT INFUTURE NOT USE
router.get("/", (req, res) => {
    User.find().select('_id name email phone age').exec().then(docs => {
        res.status(200).json({
            count: docs.length,
            users: docs
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
})

//SUCCESS
router.get("/:id", checkAuth, (req, res) => {
    User.findById({
            _id: req.params.id
        })
        .select("_id email name phone createAt cars age").populate({
            path: 'cars',
            model: 'Car',
            select: "createAt _id title brand origin price year model color gear imagesFilename"
        })
        .exec()
        .then(user => {
            res.status(200).json({
                message: "get successfully",
                user: user,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: "get unsuccessfully in GET DETAIL",
                error: err
            });
        });
});

//SUCCESS
router.post("/login", (req, res) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth - Can not find user - password or email is incorrect"
                });
            } else {
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message: "Auth failed in LOGIN"
                        });
                    }
                    if (result) {
                        user[0].generateAuthToken().then(token => {
                            console.log(token);
                            return res.status(200).json({
                                message: "Auth successfully in LOGIN",
                                user: {
                                    id: user[0]._id,
                                    email: user[0].email,
                                    token: token,
                                }
                            });
                        });
                    } else {
                        return res.status(401).json({
                            message: "Auth failed in LOGIN"
                        });
                    }
                });
            }
            // return res.status(401).json({
            //     message : "Auth failed in LOGIN2"
            // });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

// SUCCESS
router.post("/register", (req, res) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length < 1) {
                bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                    if (hash) {
                        const id = new mongoose.Types.ObjectId()
                        const user = new User({
                            _id: id,
                            email: req.body.email,
                            password: hash,
                            name: req.body.name,
                            phone: req.body.phone,
                            age: req.body.age
                        });
                        user.save().then(user => {
                            return user.generateAuthToken();
                        }).then(token => {
                            // console.log(token);
                            res.header('x-auth', token);
                            res.status(201).json({
                                message: "user save successfully",
                                token: token,
                                id: id,
                            });
                        }).catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: `user has error ${err} on Register`
                            });
                        });
                    }
                    if (err) {
                        console.log(err);
                    }
                });
            } else {
                return res.status(500).json({
                    message: "User is exist in REGISTER"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: `Error in ${err}`
            });
        });
});

//SUCCESS
router.delete("/logout", checkAuth, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).json({
            message: "user_logout remove token successfully"
        });
    }, () => {
        res.status(400).json({
            message: "user_logout remove token failure"
        });
    });
});

//HAVE NOT TESTED YET
router.patch("/:id", (req, res) => {
    const id = req.params.id;
    const ops = {};
    for (var op of Object.keys(req.body)) {
        ops[op] = req.body[op];
    }
    console.log(ops);
    User.updateOne({
        _id: id
    }, {
        $set: ops
    }).exec().then(doc => {
        console.log(doc);
        res.status(200).json({
            message: "user updated successfully",
            id: id,
            update: ops,
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: "user update failed in PATCH",
            error: err,
        });
    });
});

module.exports = router;