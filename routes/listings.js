var Contribution = require('../control/models.js').Contribution;
var Grouping = require('../control/models.js').Grouping;
var Chip = require('../control/models.js').Chip;
var Settings = require('../control/models').Settings;
var Common = require('../control/common');
var express = require('express');
var router = express.Router();

var FormData = require('form-data');
var https = require('https');

// ************************* Settings ****************************

/**
 * Return Settings
 */
router.get('/settings', function (req, res) {
  Settings.findOne({}, function (error, foundSettings) {
    if (error || foundSettings === null) {
      if (error) {
        console.log("Error finding Settings");
        res.status(500);
      } else if (!error && foundSettings === null) {
        foundSettings = new Settings().save();
        res.status(200).json({data: foundSettings});
      }
    } else {
      res.status(200).json({data: foundSettings});
    }
  })
});

/**
 * Update Settings
 */
router.put('/settings', function (req, res) {
  Settings.findOneAndUpdate({}, req.body, { upsert: true, returnNewDocument: true }, function (error, foundSet) {
    if (error || foundSet === null) {
      console.log("Error finding Settings");
      res.status(500);
    } else {
      res.status(200).json({data: foundSet});
    }
  })
});


// ************************* Chips ****************************

/**
 * Return all Chips
 */
router.get('/chips', function (req, res) {
  Chip.find({}, function (error, foundSet) {
    if (error || foundSet === null) {
      console.log("Error finding Chips");
      res.status(500);
    } else {
      res.status(200).json({data: foundSet});
    }
  })
});

// ************************* Groupings ****************************

/**
 * Return Grouping(s) data
 */
router.get('/groupings/:id?', function (req, res) {
  var query;
  if (req.params.id) {   // Find one contrigution by ID
    query = Grouping.find({_id: req.params.id})
  } else {    // Get all contributions
    query = Grouping.find({}).sort({"created": 'desc'});
  }

  query.exec(function (error, foundSet) {
    if (error || foundSet === null) {
      console.log("Error finding Groupings");
      res.status(500);
    } else {
      res.status(200).json({data: foundSet});
    }
  });
});

/**
 * Update Grouping data (supply id in body)
 */
router.put('/groupings', function (req, res) {
  Grouping.findOne({_id: req.body._id}, function (error, foundItem) {
    if (error || foundItem === null) {
      console.log("Error finding Groupings");
      res.status(500);
    } else {
      foundItem.urlSlug = req.body.urlSlug;
      foundItem.contributions = req.body.contributions;
      foundItem.titleDescriptionMode = req.body.titleDescriptionMode;
      foundItem.categoryTitle = req.body.categoryTitle;
      foundItem.categorySubtitle = req.body.categorySubtitle;
      foundItem.chips = req.body.chips;
      foundItem.contributionMode = req.body.contributionMode;
      foundItem.displayMode = req.body.displayMode;
      foundItem.votingDisplayMode = req.body.votingDisplayMode;
      foundItem.votingOptions = req.body.votingOptions;
      foundItem.serendipitousOptions = req.body.serendipitousOptions;
      foundItem.save();
      res.status(200).json({data: foundItem});
    }
  });
});

/**
 * Delete grouping data (supply id in params)
 */
router.delete('/groupings', function (req, res) {
  Grouping.findOne({_id: req.query.id}, function (error, foundItem) {
    if (error || foundItem === null) {
      console.log("Error finding Groupings");
      res.status(500);
    } else {
      foundItem.remove();
      res.status(200).json({data: foundItem});
    }
  });
});

/**
 * Create Grouping
 */
router.post('/groupings', function (req, res) {
  var grouping = new Grouping({
    urlSlug: req.body.urlSlug,
    contributions: req.body.contributions,
    categoryTitle: req.body.categoryTitle,
    categorySubtitle: req.body.categorySubtitle,
    titleDescriptionMode: req.body.titleDescriptionMode,
    contributionMode: req.body.contributionMode,
    displayMode: req.body.displayMode,
    votingOptions: req.body.votingOptions,
    serendipitousOptions: req.body.serendipitousOptions
  });

  grouping.save(function (error, newGrouping) {
    if (error || newGrouping === null) {
      console.log("Error saving new grouping" + error);
      res.status(500).json({message: error});
    } else {
      res.status(200).send({data: newGrouping});
    }
  });
});


// ************************* Contributions ****************************


/**
 * Return Contribution(s) as data, or a single formatted contribution that is suitable for Facebook
 * mode: 'data' or 'render'
 * id: (optional) id of a particular contribution
 */
router.get('/contributions/:mode/:id?', function (req, res) {
  var query;
  if (req.params.id) {   // Find one contrigution by ID
    query = Contribution.find({_id: req.params.id})
  } else {    // Get all contributions
    query = Contribution.find({}).sort({"created": 'desc'});
  }

  query.lean().exec(function (error, foundSet) {
    if (error || foundSet === null) {
      res.status(500);
    } else {
      if (req.params.mode === 'render' && foundSet.length === 1) {
        res.render('share_public', {data: foundSet});
      } else if (req.params.mode === 'data') {
        res.status(200).json({data: foundSet});
      }
    }
  });
});

/**
 * Update Contribution data (supply id in body)
 */
router.put('/contributions', function (req, res) {
  Contribution.findOne({_id: req.body._id}, function (error, foundItem) {
    if (error || foundItem === null) {
      console.log("Error finding Contribution");
      res.status(500);
    } else {
      foundItem.chips = req.body.chips;
      foundItem.save();
      res.status(200).json({data: foundItem});
    }
  });
});


/**
 * Add a new 3C Contribution
 */
router.post('/contributions', function (req, res) {

  Chip.findOne({ "_id": req.body['votingChipId'] }, function (error, foundChip) {
    if (error || foundChip === null) {
      console.log("Error finding Chip for contribution");
      res.status(400).json({data: "Error finding Chip for contribution"});
    } else {
      var contribution = new Contribution();
      contribution.origin = "3C";
      contribution.chips.push(foundChip._id);
      contribution.threeC_data.caption.text = req.body['text'];
      contribution.threeC_data.status = {
        living: req.body['status'].living,
        studying: req.body['status'].studying,
        working: req.body['status'].working,
        other: req.body['status'].other
      };

      contribution.save(function (error, newContribution) {
        if (error || newContribution === null) {
          console.log("Error saving new grouping" + error);
          res.status(500).json({message: error});
        } else {

          sendToNettskjema(req.body, function(response) {
            if (response.statusCode === 200 && response.statusMessage === 'OK') {
              res.status(200).json({data: response.statusMessage});
            } else {
              res.status(400).json({data: response.statusMessage});
            }
          });

        }
      });

    }
  });

});


function sendToNettskjema(data, callback) {

  var nettskjemaFormId = 86913;
  var tokenRequestOptions = {
    host: 'nettskjema.uio.no',
    port: 443,
    path: '/ping.html',
    method: 'GET'
  };

  https.get(tokenRequestOptions, function(tokenResult) {

    var token = '', cookie = '';

    cookie = tokenResult.headers["set-cookie"][0];
    tokenResult.setEncoding('utf8');

    tokenResult.on('data', function(postDataChunk) {
      token = postDataChunk;

      var formData = new FormData();

      // Text field
      formData.append('answersAsMap[828901].textAnswer', data.text);

      // Checkbox fields.  Fill in if true, leave empty if false
      if (data.status.living) {
        formData.append('answersAsMap[852797].answerOptions', 1854966);
      }
      if (data.status.studying) {
        formData.append('answersAsMap[852797].answerOptions', 1854967);
      }
      if (data.status.working) {
        formData.append('answersAsMap[852797].answerOptions', 1854968);
      }
      if (data.status.other) {
        formData.append('answersAsMap[852797].answerOptions', 1854969);
      }

      var formSubmitOptions = {
        protocol: 'https:',
        method: 'post',
        port: 443,
        host: 'nettskjema.uio.no',
        path: '/answer/deliver.json?formId=' + nettskjemaFormId,
        headers: {
          'NETTSKJEMA_CSRF_PREVENTION': token,
          'Cookie': cookie
        }
      };

      formData.submit(formSubmitOptions, function(err, res) {
        callback(res);
      });

    });

  });

}

module.exports = router;
