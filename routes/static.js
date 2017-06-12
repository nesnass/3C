var express = require('express');
var router = express.Router();

/* GET privacy page. */
router.get('/privacy', function(req, res, next) {
  res.render('privacy', {});
});

module.exports = router;
