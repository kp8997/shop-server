const express = require('express');
const app = express();
const path = require("path");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routeCar = require("./api/routes/car");
const routeHome = require("./api/routes/home");
const routeUser = require("./api/routes/user");
const cors = require("cors");


// ---------- ENVIRONMENT VARIABLE -----------
require('custom-env').env('staging');


//----------- DATABASE -----------------------
const url = 'mongodb://localhost:27017/test';
const name = process.env.DBNAME;
const pass = process.env.DBPASS;
mongoose.connect(`mongodb://${name}:${pass}@ds125994.mlab.com:25994/shop-server`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});
// mongoose.connect(url, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false
// })
var db = mongoose.connection;
db.on('index', function (error) {
  // "_id index cannot be sparse"
  console.log(error.message);
});
db.on('error', (error) => {
  console.log(error);
});
db.once('open', function () {
  console.log('Connected to database successfully');
});



// ----------- HELPER MODULE ------------------

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, './public/')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
//app.use('/uploads', express.static('./public/images/uploads'));
//app.use(cookieParser());
//app.set("views","./api/views");
//app.set("view engine", 'ejs');
// app.use(express.static(path.join(__dirname, './public/')));


// ----------- CORS --------------------------
app.use((req, res, next) => {
  // res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Credentials', true);
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, PATCH, DELETE");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

// --------------- ROUTE -----------------------

app.use("/", routeHome);
app.use("/car", routeCar);
app.use("/user", routeUser);

// --------------- CATCH ERROR -----------------

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  })
});

module.exports = app;