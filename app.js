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
require ('custom-env').env('staging');


//----------- DATABASE -----------------------
const name = process.env.DBNAME;
const pass = process.env.DBPASS;
mongoose.connect(`mongodb://${name}:${pass}@ds125994.mlab.com:25994/shop-server`, { useNewUrlParser: true, useCreateIndex: true}  );
var db = mongoose.connection;

db.on('error', (error) => {
    console.log(error);
  });
  db.once('open', function() {
    console.log('Connected to database successfully');
});

// ----------- CORS --------------------------
app.use((req,res,next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authoriztion");
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, PATCH, DELETE");
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, PATCH, DELETE");
          return res.status(200).json({});
    }
  next();
});

// const corsOption = {
//   origin: '*',
// }

// app.options('*', cors());
//app.use(cors());

// ----------- HELPER MODULE ------------------

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, './public/')));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
//app.use('/uploads', express.static('./public/images/uploads'));
//app.use(cookieParser());
//app.set("views","./api/views");
//app.set("view engine", 'ejs');
// app.use(express.static(path.join(__dirname, './public/')));

// --------------- ROUTE -----------------------

app.use("/", routeHome); 
app.use("/car", routeCar);
app.use("/user", routeUser);

// --------------- CATCH ERROR -----------------

app.use((req,res,next) => {
	const error = new Error("Not found");
	error.status = 404;
	next(error);
});

app.use((error,req,res,next) => {
	res.status(error.status || 500);
	res.json({
		error : {
			message : error.message
		}
	})
});

module.exports = app;