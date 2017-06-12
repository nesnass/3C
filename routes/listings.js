var Contribution = require('../control/models.js').Contribution;
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  Contribution.find({ "origin": "instagram" })
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

module.exports = router;
