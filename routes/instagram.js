/**
 * Created by richardnesnass on 15/05/2017.
 */

var Contribution = require('../control/models.js').Contribution;
var request = require('request');
var common = require('../control/common.js');

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
	Contribution.find({ origin: "instagram" })
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
        timerInterval = setInterval(collectFromInstagramByRecentTag, common.Constants.CRAWLER_REFRESH_INTERVAL_SECONDS * 1000);
        collectFromInstagramByRecentTag();
			}
		});
};


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
