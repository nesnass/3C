
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

var index = require('./routes/index');
var users = require('./routes/users');
var testList = require('./routes/testList');
var engine = require('./control/engine');
var mms = require('./control/mms');

var app = express();

// view engine setup
/*
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
*/


app.all('*', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Credentials', true);
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.set('Expires', '-1');
  res.set('Pragma', 'no-cache');
  if ('OPTIONS' === req.method) return res.status(200).end();
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/testlist', testList.getContributionListing);
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
 app.use('/mms', mms);
 app.use('/', index);
 */


//Define the database, either using MongoLab (Heroku) or local
var uristring = process.env.MONGODB_URI || 'mongodb://localhost/3c';

// MongoDB configuration
mongoose.connect(uristring, function (error, result) {
	if (error) {
		console.log("Error connecting to MongoDB Database. " + error);
	} else {
		console.log("Connected to Database");
	}
});


module.exports = app;
engine.startEngine();
