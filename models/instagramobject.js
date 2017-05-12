/**
 * Instagramobject
 *
 * @module      :: Model
 * @description :: Represent data model for the Instagramobjects
 * @author          :: Jeremy Toussaint
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Instagramobject = new Schema({

    //instagram entry info
    entry_id: {
        type: String,
        require: true
    },
    entry_created_time: {
        type: Number,
        require: true
    },
    entry_type: {
        type: String,
        require: true
    },
    entry_uri: {
        type: String,
        require: true
    },
    entry_link: {
        type: String,
        require: true
    },

    //user info
    user_id: {
        type: String,
        require: true
    },
    user_username: {
        type: String,
        require: true
    },
    user_profile_picture: {
        type: String,
        require: true
    },
    user_fullname: {
        type: String,
        require: false
    },

    //caption info
    caption_id: {
        type: String,
        require: true
    },
    caption_text: {
        type: String,
        require: true
    },

    //tags info
    tags: {
        type: Array,
        require: false
    },

    //location info
    location_id: {
        type: String,
        require: false
    },
    location_name: {
        type: String,
        require: false
    },
    location_lat: {
        type: Number,
        require: false
    },
    location_long: {
        type: Number,
        require: false
    },

    //custom 'searchable' information
    custom_sortingtag: {
        type: String,
        require: true
    },
    custom_isfrontarchive: {
        type: Boolean,
        default: false
    },
    custom_isbackarchive: {
        type: Boolean,
        default: false
    },
    custom_ispreferredtag: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Instagramobject', Instagramobject);