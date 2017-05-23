
const util = require('util');

var express = require('express');
var router = express.Router();
var request = require('request');
var Contribution = require('./models.js').Contribution;
var common = require('./common.js');


/**
 * Callback route for the MMS service (Sveve.no) to transfer message details to us
 */
router.get('/sveve', function(req, res, next) {

	var newContribution = new Contribution({
		origin: "mms",
		message_data: {
			number: req.query.number,
			msg: req.query.msg,
			prefix: req.query.prefix,
			mmsid: req.query.mmsid,
			name: req.query.name || '',
			address: req.query.address || '',
			images: []
		},
		instagram_data: {}
	});

	console.log('Adding a new MMS contribution');

	getImageBinariesFromSveve(newContribution.message_data.mmsid).then(function (imageResults) {
		imageResults.forEach(function (image) {

			newContribution.message_data.images.push(image);

			// Determine if a contribution has been made by this number already
			Contribution.find({'message_data.number': newContribution.message_data.number }).limit(1).exec(function (error, exists) {
				var responseText = common.MMSResponseMessages[2];
				if (error) {
					console.log("Error checking for existence of MMS record" + error);
				} else if (exists.length === 0) {
					responseText = common.MMSResponseMessages[3];
				}

				newContribution.save(function (error, contribution) {
					if (error || contribution === null) {
						console.log("Error saving new contribution" + error);
						res.status(500).json({ message: error });
					} else {
						// Respond to thank the MMS sender
						res.status(200).json(responseText);

						//var randomIndex = Math.floor(Math.random() * common.MMSResponseMessages.length);
						//res.status(200).json(common.MMSResponseMessages[randomIndex])
					}
				});

			});



		})


	});
});

/**
 * Given a set of message ids, get their associated images from Sveve.no
 * @param mmsids
 * @returns {*}
 */
function getImageBinariesFromSveve(mmsids) {

	return new Promise(function (resolve, reject) {

		var imagePromises = [];
		mmsids.forEach(function (id) {
			var uri = 'https://www.sveve.no/SMS/ShowImage?id=' + id;
			imagePromises.push(new Promise(function (resolve, reject) {
				request(
					{
						method: 'GET',
						uri: uri
					},
					function (error, response, body) {
						if (error) {
							reject(error);
						}
						resolve({ url: uri, blob: body });
					}
				)
			}))
		});

		Promise.all(imagePromises).then(function (imageArray) {
			resolve(imageArray);
		})
	})
}

module.exports = router;