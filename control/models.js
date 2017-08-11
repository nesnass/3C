/**
 * Created by richardnesnass on 15/05/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contributionSchema = Schema({
  origin:                       { type: String },           // "instagram", "sms", "mms", "facebook-feed", "facebook-album" ...etc
  created:                      { type: Date, default: Date.now },
  chips:                        [ { type: Schema.ObjectId, ref: 'Chip' } ],
  voting: [{
    votes: { type: Number },
    shown: { type: Number },
    grouping_id: { type: Schema.ObjectId, ref: 'Grouping'}
  }],
	message_data: {
		number :                    { type: String },           // The sender's mobile number
		msg :                       { type: String },           // Received message text
		prefix :                    { type: String },           // Password used
		short_number :              { type: String },           // Abbreviated (1963, 2065 or 2229) was used
		mmsid :                     [ { type: String } ],       // Applicable for MMS; comma separated list of ids. Retrieve images from: https://www.sveve.no/SMS/ShowImage?id=<mmsid>
		name :                      { type: String },           // The sender's name (if the number lookup is enabled)
		address :                   { type: String },            // Sender address (if number lookup is enabled)
		images : [ {
			url:                      { type: String },
			blob:                     { type: Buffer }
		} ]
	},
  facebook_data: {
    photo_id:                   { type: String },
    album_id:                   { type: String },
    user: {
      username:                 { type: String },
      profile_picture:          { type: String },
      id:                       { type: String }
    },
    images: {
      width:                    { type: Number },
      height:                   { type: Number },
      url:                      { type: String }
    },
    caption: {
      text:                     { type: String }
    }
  },
	instagram_data: {
		id:                         { type: String },
		tags:                       [ { type: String } ],
		user_has_liked:             { type: Boolean },
		likes:                      { count: { type: Number} },
		link:                       { type: String },
		created_time:               { type: String},
		user: {
			username:                 { type: String },
			profile_picture:          { type: String },
			id:                       { type: String }
			//full_name:              { type: String }
		},
		images: {
			thumbnail: {
				width:                  { type: Number },
				height:                 { type: Number },
				url:                    { type: String }
			},
			low_resolution: {
				width:                  { type: Number },
				height:                 { type: Number },
				url:                    { type: String }
			},
			standard_resolution: {
				width:                  { type: Number },
				height:                 { type: Number },
				url:                    { type: String }
			}
		},
		caption: {
			id:                       { type: String },
			text:                     { type: String },
			created_time:             { type: String },
			from: {
				id:                     { type: String },
				full_name:              { type: String },
				profile_picture:        { type: String },
				username:               { type: String }
			}
		},
		location: {
			latitude:                 { type: Number },
			longitude:                { type: Number },
			name:                     { type: String },
			id:                       { type: Number }
		}
	}
});

module.exports.Contribution = mongoose.model('Contribution', contributionSchema);

var groupingSchema = Schema({
  urlSlug:                      { type: String },
  categoryTitle:                { type: String },
  categorySubtitle:             { type: String },
  contributionMode:             { type: String },         // e.g. 'Chips', 'Feed', or 'All'
  displayMode:                  { type: String },         // e.g. 'Voting' or 'Serendipitous'
  votingDisplayMode:            { type: String },         // e.g. 'Image' or 'Caption'
  chips:                        [ { type: Schema.ObjectId, ref: 'Chip' } ],
  created:                      { type: Date, default: Date.now }
});

module.exports.Grouping = mongoose.model('Grouping', groupingSchema);

// 'Chips' are used to match Groupings with Contributions
// They should be labelled by the source album, location or timeframe
var chipSchema = Schema({
  origin_id:                    { type: String },         // e.g. Facebook Album ID
  origin:                       { type: String },         // e.g. "instagram", "sms", "mms", "facebook-feed", "facebook-album" ...etc
  label:                        { type: String }          // e.g. "Album 1", "Location 25" ...etc
});

module.exports.Chip = mongoose.model('Chip', chipSchema);
