
const util = require('util');

var express = require('express');
var router = express.Router();
var request = require('request');
var Contribution = require('./models.js').Contribution;
var common = require('./common.js');
var serverData = common.serverData;


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

			newContribution.save(function (error, contribution) {
				if (error || contribution === null) {
					console.log("Error saving new contribution" + error);
					res.status(500).json({ message: error });
				} else {
					// Respond to thank the MMS sender
					var randomIndex = Math.floor(Math.random() * common.MMSResponseMessages.length);
					res.status(200).json(common.MMSResponseMessages[randomIndex])
				}
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