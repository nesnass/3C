/**
 * Created by richardnesnass on 15/05/2017.
 */

var request = require('request');
var common = require('./common.js');
var Contribution = require('./models.js').Contribution;

var mostRecentContributionIds = [];

/**
 * Run upon startup, determine the most recent contributions already added to our database
 */
exports.startEngine = function() {
	/*
	Contribution.find({})
		.limit(20)
		.sort({"instagram_data.id": 'desc'})
		.lean()
		.exec(function (error, contributions) {
			if (error || contributions === null) {
				console.log("Setup error building recent contributions");
			} else {
				mostRecentContributionIds = contributions.map(function (contribution) {
					return contribution.instagram_data.id;
				});
				setInterval(collectFromInstagramByRecentTag, common.Constants.INSTAGRAM_REFRESH_INTERVAL_SECONDS * 1000)
			}
		});
	*/
};


/**
 *  Gets the most recent 20 entries by tag name from Instagram, and stores new ones in our DB
 */
function collectFromInstagramByRecentTag() {
	request(
		{   method: 'GET',
			uri: 'https://api.instagram.com/v1/tags/' + common.Constants.MAIN_TAG + '/media/recent?access_token=' + common.Constants.ACCESS_TOKEN
		},
		function (error, response, body) {
			if (error || response.statusCode !== 200) {
				console.log("Error getting results from Instagram: " + error.toString() );
			} else {
				var receivedItems = body.data;
				var createItems = [];

				// Determine which new items are not in our DB
				receivedItems.forEach( function(item) {
					if (item.type === "image" && mostRecentContributionIds.indexOf(item.id) === -1) {
						createItems.push(item);
					}
				});

				// Add those items to our DB
				createItems.forEach( function(item) {
					Contribution.create({ instagram_data: item }, function (error, contribution) {
						if (error) {
							console.log("Error saving new contribution" + error);
						}
						// saved!
					})
				});
			}
		}
	);
}
