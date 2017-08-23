var Contribution = require('../control/models.js').Contribution;
var Vote = require('../control/models').Vote;
var express = require('express');
var router = express.Router();


// ************************* Voting ****************************

/**
 * Update Voting data for two supplied Contribution IDs and Grouping ID
 */
router.get('/vote/:grouping_id/:c1_id/:c1_chosen/:c2_id/:c2_chosen', function(req, res) {

  Vote.findOne({ grouping : req.params.grouping_id, c1: req.params.c1_id, c2: req.params.c2_id }, function (error, foundItem) {
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
      } else {
        if (typeof foundItem.votes === 'undefined') {
          foundItem.votes = [];
        }
        foundItem.votes.push({
          c1: req.params.c1_chosen,
          c2: req.params.c2_chosen
        });
        foundItem.save();
      }

      Contribution.findOne({_id: req.params.c1_id}, function (error, foundItem1) {
        if (error || foundItem1 === null) {
          console.log("Error finding Contribution item or no item found");
          res.status(500);
        } else {
          var voteForGrouping = foundItem1.voting.find(function (v) {
            return v.grouping_id === req.params.grouping_id;
          });
          if (typeof voteForGrouping === 'undefined') {
            voteForGrouping = {
              votes: req.params.c1_chosen === 'true' ? 1 : 0,
              exposures: 1,
              grouping_id: req.params.grouping_id
            };
            foundItem1.voting.push(voteForGrouping);
          } else {
            voteForGrouping.exposures++;
            if (req.params.c1_chosen === 'true') {
              voteForGrouping.votes++;
            }
          }
          foundItem1.save();
        }

        Contribution.findOne({_id: req.params.c2_id}, function (error, foundItem2) {
          if (error || foundItem2 === null) {
            console.log("Error finding Contribution item or no item found");
            res.status(500);
          } else {
            var voteForGrouping = foundItem2.voting.find(function (v) {
              return v.grouping_id === req.params.grouping_id;
            });
            if (typeof voteForGrouping === 'undefined') {
              voteForGrouping = {
                votes: req.params.c2_chosen === 'true' ? 1 : 0,
                exposures: 1,
                grouping_id: req.params.grouping_id
              };
              foundItem2.voting.push(voteForGrouping);
            } else {
              voteForGrouping.exposures++;
              if (req.params.c2_chosen === 'true') {
                voteForGrouping.votes++;
              }
            }
            foundItem2.save();
            res.status(200).json({ data: "Success" });
          }
        })

      });

    })

});

module.exports = router;
