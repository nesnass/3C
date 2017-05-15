var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '3C' });
});

/* GET privacy page. */
router.get('/privacy', function(req, res, next) {
	res.render('privacy');
});

module.exports = router;
