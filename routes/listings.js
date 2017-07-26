var Contribution = require('../control/models.js').Contribution;
var Grouping = require('../control/models.js').Grouping;
var express = require('express');
var router = express.Router();


/**
 * Return Grouping(s) data
 */
router.get('/groupings/:id?', function(req, res, next) {
  var query;
  if (req.params.id) {   // Find one contrigution by ID
    query = Grouping.find({_id : req.params.id })
  } else {    // Get all contributions
    query = Contribution.find({}).sort({"created": 'desc'});
  }

  query.exec(function (error, foundSet) {
      if (error || items === null) {
        console.log("Error finding Groupings");
        res.status(500);
      } else {
        res.status(200).json({ data: foundSet });
      }
    });
});

/**
 * Return Contribution(s) as data, or a single formatted contribution that is suitable for Facebook
 * mode: 'data' or 'render'
 * id: (optional) id of a particular contribution
 */
router.get('/contributions/:mode/:id?', function(req, res, next) {
  var query;
  if (req.params.id) {   // Find one contrigution by ID
    query = Contribution.find({ _id : req.params.id })
  } else {    // Get all contributions
    query = Contribution.find({}).sort({"created": 'desc'});
  }

  query.lean().exec(function (error, foundSet) {
    if (error || foundSet === null) {
      res.status(500);
    } else {
      if (req.params.mode === 'render' && foundSet.length === 1) {
        res.render('share_public', {contribution: foundSet});
      } else if (req.params.mode === 'data') {
        res.status(200).json({ data: foundSet });
      }
    }
  });
});

module.exports = router;
