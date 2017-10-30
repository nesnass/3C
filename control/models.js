/**
 * Created by richardnesnass on 15/05/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contributionSchema = Schema({
  origin:                       { type: String },           // "instagram", "sms", "mms", "facebook-feed", "facebook-album", "3C" ...etc
  created:                      { type: Date, default: Date.now },
  chips:                        [ { type: Schema.ObjectId, ref: 'Chip' } ],
  vetted:                       { type: Boolean, default: true },
  voting: [{
    votes: { type: Number },
    exposures: { type: Number },
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
  threeC_data: {
    caption: {
      text:                     { type: String }
    },
    status: {
      living:                   { type: Boolean },
      studying:                 { type: Boolean },
      working:                  { type: Boolean },
      other:                    { type: Boolean }
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
  titleDescriptionMode:         { type: String },         // e.g. 'Automatic' or 'Custom'
  contributionMode:             { type: String },         // e.g. 'Chips', 'Feed', or 'All'
  displayMode:                  { type: String },         // e.g. 'Voting' or 'Serendipitous', 'VotingResults'
  votingOptions: {
    displayMode: { type: String },                        // 'Image', 'Caption'
    imageCaption: { type: Boolean },
    resultsVisible: { type: Boolean }
  },
  votingResultsOptions: {
    groupings: [ { type: Schema.ObjectId, ref: 'Grouping' } ]
  },
  serendipitousOptions: {
    randomSelection: { type: Boolean }
  },
  chips:                        [ { type: Schema.ObjectId, ref: 'Chip' } ],
  created:                      { type: Date, default: Date.now }
});

module.exports.Grouping = mongoose.model('Grouping', groupingSchema);

// 'Chips' are used to match Groupings with Contributions
// They should be labelled by the source album, location or timeframe
var chipSchema = Schema({
  origin_id:                    { type: String },         // e.g. Facebook Album ID
  origin:                       { type: String },         // e.g. "instagram", "sms", "mms", "facebook-feed", "facebook-album", "3C" ...etc
  label:                        { type: String },         // e.g. "Album 1", "Location 25" ...etc
  description:                  { type: String },         // e.g. "This is the caption of the album"
  location:                     { type: String }
});

module.exports.Chip = mongoose.model('Chip', chipSchema);

// A Vote is created for a particular combination of Contributions, and a particular Grouping
var voteSchema = Schema({
  grouping:                     { type: Schema.ObjectId, ref: 'Grouping' },
  c1:                           { type: Schema.ObjectId, ref: 'Contribution' },
  c2:                           { type: Schema.ObjectId, ref: 'Contribution' },
  votes: [{
    c1:                         { type: Boolean },
    c2:                         { type: Boolean }
  }]
});

module.exports.Vote = mongoose.model('Vote', voteSchema);

// 'Settings' are used to store defaults
// They should be labelled by the source album, location or timeframe
var settingsSchema = Schema({
  defaultGroupingId:                    { type: String },         // The Grouping we go to when landing at the main site URL
  defaultLoadPage:                      { type: String }          // A shortcut to the URL for the default page
});

module.exports.Settings = mongoose.model('Settings', settingsSchema);

