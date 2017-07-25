var Contribution = require('../control/models.js').Contribution;
var express = require('express');
var router = express.Router();

/* GET a full list of contributions */
router.get('/', function(req, res, next) {
  Contribution.find({})
    .sort({"created": 'desc'})
    .lean()
    .exec(function (error, items) {
      if (error || items === null) {
        console.log("Setup error building recent contributions");
        res.status(500);
      } else {
        //res.render('testList', { title: '3C Contribution Listing', contributions: items });
        res.status(200).json({ data: items });
      }
    });
});

/**
 * Return a single, formatted contribution that is suitable for Facebook
 */
router.get('/:contribution_id', function(req, res, next) {
  Contribution.find({_id : req.param("contribution_id")})
    .lean()
    .exec(function (error, item) {
      if (error || item === null) {
        res.status(500);
      } else {
        //res.render('testList', { title: '3C Contribution Listing', contributions: items });
        res.render('share_public', { contribution: item});
      }
    });
});

module.exports = router;
