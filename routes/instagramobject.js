/**
 * Instagramobject
 *
 * @module      :: Routes
 * @description :: Maps routes and actions
 * @author          :: Jeremy Toussaint
 */

var Instagramobject = require('../models/instagramobject.js');

module.exports = function (app, io) {

    /**
     * Find and retrieves all instagramobjects
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    findAllInstagramobjects = function (req, res) {
        console.log("GET - /instagramobjects");

        return Instagramobject.find(function (err, instagramobjects) {
            if (!err) {
                return res.send(instagramobjects);
            } else {
                res.statusCode = 500;
                console.log('--> Internal error(%d): %s', res.statusCode, err.message);
                return res.send({ error: 'Server error' });
            }
        });
    };


    /**
     * Find and retrieves a single instagramobject by its ID
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    findById = function (req, res) {

        console.log("GET - /instagramobject/:id");
        return Instagramobject.findById(req.params.id, function (err, instagramobject) {

            if (!instagramobject) {
                res.statusCode = 404;
                return res.send({ error: 'Not found' });
            }

            if (!err) {
                return res.send({ status: 'OK', instagramobject: instagramobject });
            } else {

                res.statusCode = 500;
                console.log('--> Internal error(%d): %s', res.statusCode, err.message);
                return res.send({ error: 'Server error' });
            }
        });
    };


    /**
     * Creates a new instagramobject from the data request
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    addInstagramobject = function (req, res) {

        console.log('--> POST - /instagramobject');

        var instagramobject = new Instagramobject({

            //instagram entry info
            entry_id: req.body.entry_id,
            entry_created_time: req.body.entry_created_time,
            entry_type: req.body.entry_type,
            entry_uri: req.body.entry_uri,

            //user info
            user_id: req.body.user_id,
            user_username: req.body.user_username,
            user_profile_picture: req.body.user_profile_picture,
            user_fullname: req.body.user_fullname,

            //caption info
            caption_id: req.body.caption_id,
            caption_text: req.body.caption_text,

            //tags info
            tags: req.body.tags,

            //location info
            location_id: req.body.location_id,
            location_name: req.body.location_name,
            location_lat: req.body.location_lat,
            location_long: req.body.location_long,

            //custom 'searchable' information
            custom_sortingtag: req.body.custom_sortingtag,
            custom_isfrontarchive: req.body.custom_isfrontarchive,
            custom_isbackarchive: req.body.custom_isbackarchive

        });

        instagramobject.save(function (err) {

            if (err) {

                console.log('--> Error while saving instagramobject: ' + err);
                res.send({ error: err });
                return;

            } else {

                console.log("Instagramobject created");
                return res.send({ status: 'OK', instagramobject: instagramobject });

            }

        });

    };


    /**
     * Update a instagramobject by its ID
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    updateInstagramobject = function (req, res) {

        console.log("PUT - /instagramobject/:id");
        return Instagramobject.findById(req.params.id, function (err, instagramobject) {

            if (!instagramobject) {
                res.statusCode = 404;
                return res.send({ error: 'Not found' });
            }

            //instagram entry info
            if (req.body.entry_id != null) instagramobject.entry_id = req.body.entry_id;
            if (req.body.entry_created_time != null) instagramobject.entry_created_time = req.body.entry_created_time;
            if (req.body.entry_type != null) instagramobject.entry_type = req.body.entry_type;
            if (req.body.entry_uri != null) instagramobject.entry_uri = req.body.entry_uri;
            if (req.body.entry_link != null) instagramobject.entry_link = req.body.entry_link;

            //user info
            if (req.body.user_id != null) instagramobject.user_id = req.body.user_id;
            if (req.body.user_username != null) instagramobject.user_username = req.body.user_username;
            if (req.body.user_profile_picture != null) instagramobject.user_profile_picture = req.body.user_profile_picture;
            if (req.body.user_fullname != null) instagramobject.user_fullname = req.body.user_fullname;

            //caption info
            if (req.body.caption_id != null) instagramobject.caption_id = req.body.caption_id;
            if (req.body.caption_text != null) instagramobject.caption_text = req.body.caption_text;

            //tags info
            if (req.body.tags != null) instagramobject.tags = req.body.tags;

            //location info
            if (req.body.location_id != null) instagramobject.location_id = req.body.location_id;
            if (req.body.location_name != null) instagramobject.location_name = req.body.location_name;
            if (req.body.location_lat != null) instagramobject.location_lat = req.body.location_lat;
            if (req.body.location_long != null) instagramobject.location_long = req.body.location_long;

            //custom 'searchable' information
            if (req.body.custom_sortingtag != null) instagramobject.custom_sortingtag = req.body.custom_sortingtag;
            if (req.body.custom_isfrontarchive != null) instagramobject.custom_isfrontarchive = req.body.custom_isfrontarchive;
            if (req.body.custom_isbackarchive != null) instagramobject.custom_isbackarchive = req.body.custom_isbackarchive;

            return instagramobject.save(function (err) {
                if (!err) {
                    console.log('--> Updated');
                    return res.send({ status: 'OK', instagramobject: instagramobject });
                } else {
                    if (err.name == 'ValidationError') {
                        res.statusCode = 400;
                        res.send({ error: 'Validation error' });
                    } else {
                        res.statusCode = 500;
                        res.send({ error: 'Server error' });
                    }
                    console.log('--> Internal error(%d): %s', res.statusCode, err.message);
                }

                res.send(instagramobject);

            });
        });
    };


    /**
     * Delete a instagramobject by its ID
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    deleteInstagramobject = function (req, res) {

        console.log("DELETE - /instagramobject/:id");
        return Instagramobject.findById(req.params.id, function (err, instagramobject) {
            if (!instagramobject) {
                res.statusCode = 404;
                return res.send({ error: 'Not found' });
            }

            return instagramobject.remove(function (err) {
                if (!err) {
                    console.log('--> Removed instagramobject');
                    return res.send({ status: 'OK' });
                } else {
                    res.statusCode = 500;
                    console.log('--> Internal error(%d): %s', res.statusCode, err.message);
                    return res.send({ error: 'Server error' });
                }
            })
        });
    };

    /**
     * Find an instagramobject by a "new" tag
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    findByNewTagName = function (req, res) {

        console.log("GET - /instagramobject/newwithtag/:tag");
        app.getNewEntriesWithTag(req.params.tag).then(
            function (data) {
                if(data.length > 0) {
                    return res.send({tag: req.params.tag, entry: data.pop()});
                }
                else {
                    return res.send({ error: 'Result empty' });
                }
            }
        );
    };

    /**
     * Find an instagramobject by an "archive" tag
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    findByArchiveTagName = function (req, res) {

        console.log("GET - /instagramobject/archivewithtag/:tag");

        app.getArchiveEntriesWithTag(req.params.tag).then(
            function (data) {
                if(data.length > 0) {
                    return res.send({tag: req.params.tag, entry: data.pop()});
                }
                else {
                    return res.send({ error: 'Result empty' });
                }
            }
        );
    };



    /**
     * Display tags in use
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    showServerStatus = function (req, res) {

        console.log("GET - /tags");
        return res.send(app.GetStatus());
    };



    //Link routes and actions
    app.get('/instagramobject', findAllInstagramobjects);
    app.get('/instagramobject/:id', findById);
    app.get('/instagramobject/newwithtag/:tag', findByNewTagName);
    app.get('/instagramobject/archivewithtag/:tag', findByArchiveTagName);
    app.post('/instagramobject', addInstagramobject);
    app.put('/instagramobject/:id', updateInstagramobject);
    app.delete('/instagramobject/:id', deleteInstagramobject);
    app.get('/status', showServerStatus);
};