var Contribution = require('../control/models.js').Contribution;
var Vote = require('../control/models').Vote;
var express = require('express');
var router = express.Router();


// ************************* Voting ****************************

/**
 * Update Voting data for two supplied Contribution IDs and Grouping ID
 */
router.get('/vote/:grouping_id/:c1_id/:c1_chosen/:c2_id/:c2_chosen', function(req, res) {

  Vote.find({ grouping : req.params.grouping_id, c1: req.params.c1_id, c2: req.params.c2_id }, function (error, foundItem) {
      if (error) {
        console.log("Error finding Vote item");
        res.status(500);
      } else if (foundItem === null) {
        Vote.create({
          grouping: req.params.grouping_id,
          c1: req.params.c1_id,
          c2: req.params.c2_id,
          votes: [{
            c1: req.params.c1_chosen,
            c2: req.params.c2_chosen
          }]
        });
        res.status(200);
      } else {
        if (!foundItem.hasOwnProperty('votes')) {
          foundItem.votes = [];
        }
        foundItem.votes.push({
          c1: req.params.c1_chosen,
          c2: req.params.c2_chosen
        });
        foundItem.save();
        res.status(200);
      }

      Contribution.find({_id: req.params.c1_id}, function (error, foundItem) {
        if (error || foundItem === null) {
          console.log("Error finding Contribution item or no item found");
          res.status(500);
        } else {
          var voteForGrouping = foundItem.voting.find(function (v) {
            return v.grouping_id === req.params.grouping_id;
          });
          if (typeof voteForGrouping === 'undefined') {
            voteForGrouping = {
              votes: 0,
              exposures: 0,
              grouping_id: req.params.grouping_id
            };
            foundItem.voting.push(voteForGrouping);
          }
          voteForGrouping.exposures++;
          if (req.params.c1_chosen) {
            voteForGrouping.votes++;
          }
        }
      });

      Contribution.find({_id: req.params.c2_id}, function (error, foundItem) {
        if (error || foundItem === null) {
          console.log("Error finding Contribution item or no item found");
          res.status(500);
        } else {
          var voteForGrouping = foundItem.voting.find(function (v) {
            return v.grouping_id === req.params.grouping_id;
          });
          if (typeof voteForGrouping === 'undefined') {
            voteForGrouping = {
              votes: 0,
              exposures: 0,
              grouping_id: req.params.grouping_id
            };
            foundItem.voting.push(voteForGrouping);
          }
          voteForGrouping.exposures++;
          if (req.params.c2_chosen) {
            voteForGrouping.votes++;
          }
        }
      })

    })

});

module.exports = router;
