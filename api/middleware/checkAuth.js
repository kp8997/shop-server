const jwt = require('jsonwebtoken');
const User = require("../models/user");

module.exports = (req, res, next) => {
    const authorization = req.header('Authorization');
    if(authorization) {
        const token = authorization.split(" ")[1];
        console.log("token :" ,token);
        User.findByToken(token).then(user => {
            if (!user) {
                return Promise.reject();
            } else {
                req.user = user;
                req.token = token;
                next();
            }
        }).catch(err => {
            console.log(err);
            return res.status(401).json({
                message : "Auth faild in CHECK AUTH",
                error : err
            });
        });
    } else {
        res.status(401).json({
            message : "Not Have Token in Authorization in header"
        });
    }
    
}