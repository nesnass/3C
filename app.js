/*
    Server and Angular App should be started by calling 'node ./bin/www' or 'ng serve'
 */

var utilities = require('./control/utility.js');

/********* load environment variables locally *********/
require('dotenv').config({ silent: process.env.NODE_ENV === 'production' });

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
mongoose.Promise = require('q').Promise;

var facebookEngine = require('./routes/facebook');
var instagramEngine = require('./routes/instagram');
var static_pages = require('./routes/static');
var listings = require('./routes/listings');
var voting = require('./routes/voting');
var mms = require('./routes/mms');
var auth = require('./routes/authorisation');

var app = express();

// view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.all('*', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Credentials', true);
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  //res.set('Expires', '-1');
  res.set('Pragma', 'no-cache');
  if ('OPTIONS' === req.method) return res.status(200).end();
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));    // Compile app using 'ng build' to update dist directory
app.use('/', static_pages);
app.use('/mms', mms);
app.use('/listings', listings);
app.use('/voting', voting);
app.use('/auth', auth);
//app.use('/', express.static(__dirname + '/dist'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

/*
 app.use('/users', users);
 app.use('/', index);
 */



//Define the database, either using MongoLab (Heroku) or local
var uristring = process.env.MONGODB_URI;
var dbConnectOptions = {};

if (app.get('env') === 'development') {
  app.locals.pretty = true;
  var port = process.env.PORT;
  console.log('3C is listening on port: ' + port);

  dbConnectOptions = {
    db: { native_parser: true },
    server: { poolSize: 5 },
    replset: { rs_name: 'myReplicaSetName' },
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD
  };

  app.listen(port);
}

// MongoDB configuration
mongoose.connect(uristring, dbConnectOptions, function (error, result) {
	if (error) {
		console.log("Error connecting to MongoDB Database. " + error);
	} else {
		console.log("Connected to Database");
	}
});

// utilities.setVettingFlagOnAll();

process.on('SIGINT', function() {
  mongoose.disconnect();
  process.exit();
});

module.exports = app;



// Activate service crawlers here

facebookEngine.startEngine();
// instagramEngine.startEngine();
