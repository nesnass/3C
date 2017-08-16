/**
 * Created by richardnesnass on 15/05/2017.
 */

var Contribution = require('../control/models.js').Contribution;
var Chip = require('../control/models.js').Chip;
var Grouping = require('../control/models.js').Grouping;
var request = require('request');
var common = require('../control/common.js');
var ASYNC = require('async');
var URL = require('url');
var FB = require('fb');

var serverData = common.serverData;
var timerInterval = null;

process.on('SIGINT', function () {
  console.log('Got SIGINT.  Press Control-D to exit.');
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = null;
});

/**
 * Run upon startup, determine the most recent contributions already added to our database
 */
exports.startEngine = function() {
	Contribution.find({ origin: "facebook" })
		.limit(20)
		.sort({"facebook_data.photo_id": 'desc'})
		.lean()
		.exec(function (error, contributions) {
			if (error || contributions === null) {
				console.log("Setup error building recent contributions");
			} else {
				serverData.mostRecentFacebookIds = contributions.map(function (contribution) {
					return contribution.facebook_data.photo_id;
				});
        timerInterval = setInterval(facebookCrawlerControl, common.Constants.CRAWLER_REFRESH_INTERVAL_SECONDS * 1000);
        facebookCrawlerControl();
			}
		});
};

function facebookCrawlerControl() {
  getFacebookAuthToken(function(error) {
    if (error) {
      console.error("Failed to acquire Facebook Token: %s", error.message);
    } else {
      console.log("Got Facebook auth token");

      var params = {
        fields: "description,name"
      };

      // Collect curated (workshop) Contributions from the facebook 'Album' - added by the Page administrator

      // Get a list of existing Chips before we begin
      Chip.find({ origin: "facebook-album" }, function(error, chips) {
        if (error || chips === null) {
          console.log("Error finding Chips for Facebook crawl");
        } else {

          // 1. Set up a 'Chip' for each album id found
          // 2. Set up a 'Contribution' for each photo in each album (if not already stored)
          // 3. Mark Contribution with Chip
          collectFromFacebook(process.env.FB_PAGE_ID + "/albums", params, function(error, results) {
            if (error) {
              console.error("Failed to get Facebook album list: %s", error.message);
            } else {
              results.filter( function(album) {  // Ignore Facebook standard albums
                return ['Profile Pictures', 'Timeline Photos', 'Cover Photos'].indexOf(album.name) === -1;
              }).forEach( function(filteredAlbum) {

                // Check whether this album is already listed as a Chip, or not
                var chip = getChipContainingOriginId(chips, filteredAlbum.id);
                if (typeof chip !== 'undefined') {
                  if (chip.label !== filteredAlbum.name) {
                    chip.label = filteredAlbum.name;
                    chip.save();
                  }
                  syncContributionsFromAlbum(filteredAlbum, chip);
                } else {
                  var newChip = new Chip({
                    origin_id: filteredAlbum.id,
                    origin: "facebook-album",
                    label: filteredAlbum.name
                  });
                  newChip.save();
                  syncContributionsFromAlbum(filteredAlbum, newChip);
                }
              })
            }
          });

        }
      });


      // Collect other Contributions from the facebook 'Wall'

      // This is for contributions from external community to the page
      // ToDo...

    }
  })
}

/**
 * Synchronise a local Contribution for each photo found in the album
 * @param album
 * @param chip
 */
function syncContributionsFromAlbum(album, chip) {
  var params = {
    fields: "name,images,album,from"
  };

  collectFromFacebook(album.id + "/photos", params, function(error, results) {
    if (error) {
      console.error("Failed to get Facebook album list: %s", error.message);
    } else {

      // Determine photo IDs in the current version of this Facebook Album
      var currentIdsInAlbum = results.map( function(photo) {
        return photo.id;
      });

      // Remove any items not currently in the album
      Contribution.find({ 'origin': "facebook-album", 'facebook_data.photo_id': { $nin: currentIdsInAlbum } } ).remove();

      // The result.data object will contain an 'images' list, first item being the largest. Get this one for now.
      results.forEach( function(photo) {
        Contribution.findOne({ 'origin': "facebook-album", 'facebook_data.photo_id': photo.id }, function(error, contribution) {
          if (error) {
            console.log("Error finding Contribution for facebook curated album");
          } else if (contribution === null) {

            // This photo is not in our database, retrieve additional profile info
            var params = {
              fields: "picture,name"
            };
            collectFromFacebook(photo.from.id, params, function(error, user) {
              if (error) {
                console.log("Error finding User for facebook photo");
              } else {

                // Create a new Contribution
               Contribution.create({
                  origin: "facebook-album",
                  facebook_data: {
                    photo_id: photo.id,
                    album_id: album.id,
                    user: {
                      username: user.name,
                      profile_picture: user.picture.data.url,
                      id: user.id
                    },
                    images: {
                      width: photo.images[0].width,
                      height: photo.images[0].height,
                      url: photo.images[0].source
                    },
                    caption: {
                      text: photo.name
                    }
                  },
                  chips: [chip._id]
                });

              }
            });

          } else {

            // This photo already exists, update the caption if necessary
            contribution.facebook_data.caption.text = photo.name;
            contribution.save();

          }
        })
      })
    }
  });

}

/**
 * Determine if an Album ID is contained in one of the existing Chips
 * @param chips
 * @param id
 */
function getChipContainingOriginId(chips, id) {
  return chips.find( function(chip) {
    return chip.origin_id === id;
  })
}


function getFacebookAuthToken(callbackFn) {
  FB.napi('oauth/access_token', {
    client_id: process.env.FB_APP_ID,
    client_secret: process.env.FB_APP_SECRET,
    grant_type: 'client_credentials'
  }, function (error, result) {
    if (!error) {
      // Store the access token for later queries to use
      FB.setAccessToken(result.access_token);
    }
    if (callbackFn) callbackFn(error);
  });
}

function facebookLoginCallback() {

}


function collectFromFacebook(graph, params, callbackFn) {

  var done = false;
  var results = [];
  params['limit'] = 100;

  ASYNC.doUntil(function(callbackFn) {
    FB.napi(graph, params, function(error, result) {   // Call Facebook API to get a page of results for the requested graph point
      if (error) {
        callbackFn(error);
      } else {
        if (result.hasOwnProperty('data')) {
          results = results.concat(result.data);
        } else {

          // 'User' endpoint usually does not return 'paging' & 'data' objects
          results = result;
        }
        if (!result.hasOwnProperty('paging') || !result.paging.next || results.length >= 1000) {
          done = true;
        } else {
          params = URL.parse(result.paging.next, true).query;
        }
        callbackFn();
      }
    })
  }, function() {   // Truth test to determine when to stop processing pages
    return done;
  }, function(error) {    // Final callback to run at the end of the loop
    if (error && error.type === 'OAuthException') {
      console.error('Need to reauthenticate with Facebook: %s', err.message);
      getFacebookAuthToken(function (err) {         // the access token has expired since we acquired it, so get it again
        if (!err) {
          setImmediate(function() {  // Now try again (n.b. setImmediate requires Node v10)
            collectFromFacebook(callbackFn);
          });
        } else if (callbackFn) {
          callbackFn(err);
        }
      });
    } else if (callbackFn) {
      callbackFn(null, results);
    }
  })

}

