/**
 * Created by richardnesnass on 15/05/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contributionSchema = Schema({
	origin:                         { type: String },           // "instagram", "sms", "mms", ...etc
	created:                        { type: Date, default: Date.now },
	message_data: {
		number :                    { type: String },           // The sender's mobile number
		msg :                       { type: String },           // Received message text
		prefix :                    { type: String },           // Password used
		short_number :              { type: String },           // Abbreviated (1963, 2065 or 2229) was used
		mmsid :                     [ { type: String } ],       // Applicable for MMS; comma separated list of ids. Retrieve images from: https://www.sveve.no/SMS/ShowImage?id=<mmsid>
		name :                      { type: String },           // The sender's name (if the number lookup is enabled)
		address :                   { type: String },            // Sender address (if number lookup is enabled)
		images : [ {
			url:                    { type: String },
			blob:                   { type: Buffer }
		} ]
	},
	instagram_data: {
		id:                         { type: String },
		tags:                       [ { type: String } ],
		user_has_liked:             { type: Boolean },
		likes:                      { count: { type: Number} },
		link:                       { type: String },
		created_time:               { type: String},
		user: {
			username:               { type: String },
			profile_picture:        { type: String },
			id:                     { type: String }
			//full_name:              { type: String }
		},
		images: {
			thumbnail: {
				width:              { type: Number },
				height:             { type: Number },
				url:                { type: String }
			},
			low_resolution: {
				width:              { type: Number },
				height:             { type: Number },
				url:                { type: String }
			},
			standard_resolution: {
				width:              { type: Number },
				height:             { type: Number },
				url:                { type: String }
			}
		},
		caption: {
			id:                     { type: String },
			text:                   { type: String },
			created_time:           { type: String },
			from: {
				id:                 { type: String },
				full_name:          { type: String },
				profile_picture:    { type: String },
				username:           { type: String }
			}
		},
		location: {
			latitude:               { type: Number },
			longitude:              { type: Number },
			name:                   { type: String },
			id:                     { type: Number }
		}
	}
});

module.exports.Contribution = mongoose.model('Contribution', contributionSchema);
