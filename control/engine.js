/**
 * Created by richardnesnass on 15/05/2017.
 */

var Contribution = require('./models.js').Contribution;
var request = require('request');
var common = require('./common.js');
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
	Contribution.find({})
		.limit(20)
		.sort({"instagram_data.id": 'desc'})
		.lean()
		.exec(function (error, contributions) {
			if (error || contributions === null) {
				console.log("Setup error building recent contributions");
			} else {
				serverData.mostRecentInstagramIds = contributions.map(function (contribution) {
					return contribution.instagram_data.id;
				});
				// setInterval(collectFromInstagramByRecentTag, common.Constants.INSTAGRAM_REFRESH_INTERVAL_SECONDS * 1000)
        // timerInterval = setInterval(collectFromFacebook, common.Constants.CRAWLER_REFRESH_INTERVAL_SECONDS * 1000)


        // *********** testing ************
        getFacebookAuthToken(function(error) {
          if (error) {
            console.error("Failed to acquire Facebook Token: %s", error.message);
          } else {
            console.log("Got Facebook auth token");
            collectFromFacebookFeed("SBSWorldNewsAustralia/feed", function(error, results) {
              if (error) {
                console.error("Failed to get Facebook Feed: %s", error.message);
              } else {
                results.forEach(function(i) {
                  var headline = i.message || i.name;
                  // If it's an embedded video, possible there's no headline
                  if (headline) {
                    console.log(headline);
                  }
                })
              }
            })
          }
        })



			}
		});
};


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


function collectFromFacebookFeed(feed, callbackFn) {

  var done = false;
  var results = [];
  var params = {
    fields: 'message,name',
    limit: 100
  };

  ASYNC.doUntil(function(callbackFn) {
    FB.napi(feed, params, function(error, result) {   // Call Facebook API to get a page of results for the requested feed
      if (error) {
        callbackFn(error);
      }
      results = results.concat(result.data);
      if (!result.paging.next || results.length >= 1000) {
        done = true;
      } else {
        params = URL.parse(result.paging.next, true).query;
      }
      callbackFn();
    })
  }, function() {   // Truth test to determine when to stop processing pages
    return done;
  }, function(error) {    // Final callback to run at the end of the loop
    if (error && error.type === 'OAuthException') {
      console.error('Need to reauthenticate with Facebook: %s', err.message);
      getFacebookAuthToken(function (err) {         // the access token has expired since we acquired it, so get it again
        if (!err) {
          setImmediate(function() {  // Now try again (n.b. setImmediate requires Node v10)
            collectFromFacebookFeed(callbackFn);
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


/**
 *  Gets the most recent 20 entries by tag name from Instagram, and stores new ones in our DB
 */
function collectFromInstagramByRecentTag() {
	request(
		{   method: 'GET',
			uri: 'https://api.instagram.com/v1/tags/' + common.Constants.MAIN_TAG + '/media/recent?access_token=' + process.env.INSTAGRAM_ACCESS_TOKEN
		},
		function (error, response, body) {
			if (error || response.statusCode !== 200) {
				console.log("Error getting results from Instagram. status " + response.statusCode );
			} else {
				var receivedItems = JSON.parse(body).data;
				var createItems = [];

				// Determine which new items are not in our DB
				receivedItems.forEach( function(item) {
					if (item.type === "image" && serverData.mostRecentInstagramIds.indexOf(item.id) === -1) {
						createItems.push(item);
					}
				});

				if (createItems.length > 0) {
					console.log('Adding ' + createItems.length + ' new Instagram contributions');
				}

				// Add those items to our DB
				createItems.forEach( function(item) {
					Contribution.create({ origin: "instagram", instagram_data: item }, function (error, contribution) {
						if (error) {
							console.log("Error saving new contribution" + error);
						} else {
							serverData.mostRecentInstagramIds.unshift(item.id);
						}
					})
				});
			}
		}
	);
}
