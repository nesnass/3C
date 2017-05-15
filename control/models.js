/**
 * Created by richardnesnass on 15/05/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contributionSchema = Schema({
	type:                           { type: String },           // "instagram", "sms", "mms", ...etc
	mms_data: {
		from:                       { type: String },
		message:                    { type: String },
		images:                     [ { type: String } ]
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
			id:                     { type: String },
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
