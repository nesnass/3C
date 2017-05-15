/**
 * Created by richardnesnass on 15/05/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contributionSchema = Schema({
	type:                           { type: String },           // "instagram", "sms", "mms", ...etc
	instagram_data: {
		tags:                       [ { type: String } ],
		likes:                      { count: { type: Number} },
		link:                       { type: String },
		created_time:               { type: String},
		user: {
			username:               { type: String },
			profile_picture:        { type: String },
			id:                     { type: String },
			full_name:              { type: String }
		},
		id:                         { type: String }
	}
});

module.exports.Contribution = mongoose.model('Contribution', contributionSchema);
