var Contribution = require('../control/models.js').Contribution;
var Grouping = require('../control/models.js').Grouping;
var Chip = require('../control/models.js').Chip;
var Common = require('../control/common');
var express = require('express');
var router = express.Router();


// ************************* Chips ****************************

/**
 * Return all Chips
 */
router.get('/chips', function(req, res) {
  Chip.find({}, function(error, foundSet) {
    if (error || foundSet === null) {
      console.log("Error finding Chips");
      res.status(500);
    } else {
      res.status(200).json({ data: foundSet });
    }
  })
});

// ************************* Groupings ****************************

/**
 * Return Grouping(s) data
 */
router.get('/groupings/:id?', function(req, res) {
  var query;
  if (req.params.id) {   // Find one contrigution by ID
    query = Grouping.find({_id : req.params.id })
  } else {    // Get all contributions
    query = Grouping.find({}).sort({"created": 'desc'});
  }

  query.exec(function (error, foundSet) {
      if (error || foundSet === null) {
        console.log("Error finding Groupings");
        res.status(500);
      } else {
        res.status(200).json({ data: foundSet });
      }
    });
});

/**
 * Update Grouping data (supply id in body)
 */
router.put('/groupings', function(req, res) {
  Grouping.findOne({_id : req.body._id }, function (error, foundItem) {
    if (error || foundItem === null) {
      console.log("Error finding Groupings");
      res.status(500);
    } else {
      foundItem.urlSlug = req.body.urlSlug;
      foundItem.contributions = req.body.contributions;
      foundItem.categoryTitle = req.body.categoryTitle;
      foundItem.categorySubtitle = req.body.categorySubtitle;
      foundItem.chips = req.body.chips;
      foundItem.contributionMode = req.body.contributionMode;
      foundItem.displayMode = req.body.displayMode;
      foundItem.save();
      res.status(200).json({ data: foundItem });
    }
  });
});

/**
 * Delete grouping data (supply id in params)
 */
router.delete('/groupings', function(req, res) {
  Grouping.findOne({_id : req.query.id }, function (error, foundItem) {
    if (error || foundItem === null) {
      console.log("Error finding Groupings");
      res.status(500);
    } else {
      foundItem.remove();
      res.status(200).json({ data: foundItem });
    }
  });
});

/**
 * Create Grouping
 */
router.post('/groupings', function(req, res) {
  var grouping = new Grouping({
    urlSlug: req.body.urlSlug,
    contributions: req.body.contributions,
    categoryTitle: req.body.categoryTitle,
    categorySubtitle: req.body.categorySubtitle,
    contributionMode: req.body.contributionMode,
    displayMode: req.body.displayMode
  });

  grouping.save(function (error, newGrouping) {
    if (error || newGrouping === null) {
      console.log("Error saving new grouping" + error);
      res.status(500).json({ message: error });
    } else {
      res.status(200).send({ data: newGrouping });
    }
  });
});




// ************************* Contributions ****************************


/**
 * Return Contribution(s) as data, or a single formatted contribution that is suitable for Facebook
 * mode: 'data' or 'render'
 * id: (optional) id of a particular contribution
 */
router.get('/contributions/:mode/:id?', function(req, res) {
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
        res.render('share_public', { data: foundSet} );
      } else if (req.params.mode === 'data') {
        res.status(200).json({ data: foundSet });
      }
    }
  });
});

/**
 * Update Contribution data (supply id in body)
 */
router.put('/contributions', function(req, res) {
  Contribution.findOne({_id : req.body._id }, function (error, foundItem) {
    if (error || foundItem === null) {
      console.log("Error finding Contribution");
      res.status(500);
    } else {
      foundItem.chips = req.body.chips;
      foundItem.save();
      res.status(200).json({ data: foundItem });
    }
  });
});

module.exports = router;
