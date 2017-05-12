/*
 *
 * Main App file App.js
 * @author Jeremy Toussaint
 *
 *
 */

// This is needed if the app is run on heroku:
var port = process.env.PORT || 8080;

// Dependencies requirements

var newrelic = require('newrelic');                         //app monitoring
var express = require('express');
var mongoose = require("mongoose");
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var requestify = require('requestify');
mongoose.Promise = require('q').Promise;
var events = require('events');
var eventEmitter = new events.EventEmitter();
var app = express();

var group01sockets = [];
var group02sockets = [];
var group03sockets = [];
var group04sockets = [];

//app config
app.use(morgan('dev')); 					                // log every request to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));					                // pull information from html in POST
app.use(methodOverride()); 					                // simulate DELETE and PUT
app.use(express.static(path.join(__dirname, 'public')));    // set the static files location (css, js, etc..)
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return next();
});

//Define the database, either using MongoLab (Heroku) or local
var uristring = process.env.MONGOLAB_URI || 'mongodb://localhost/instagramobject';

// MongoDB configuration
mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log('--> error connecting to MongoDB Database. ' + err);
    } else {
        console.log('--> Connected to Database');
        playIdleMode();

    }
});

//Start the app on the given port
var server = app.listen(port);
//Define a socket connection attached to the app
var io = require('socket.io').listen(server);
io.on('connection', function (socket) {

        //handling the disconnection of clients, attached to the current socket
        socket.on('disconnect', function () {

            //remove the disconnected socket from the global arrays
            if (group01sockets.indexOf(socket) > -1) {
                group01sockets.splice(group01sockets.indexOf(socket), 1);
                console.log('--> registeredGroup01 disconnect: ' + socket.id + ' - ' + group01sockets.length);
            }
            else if (group02sockets.indexOf(socket) > -1) {
                group02sockets.splice(group02sockets.indexOf(socket), 1);
                console.log('--> registeredGroup02 disconnect: ' + socket.id + ' - ' + group02sockets.length);
            }
            else if (group03sockets.indexOf(socket) > -1) {
                group03sockets.splice(group03sockets.indexOf(socket), 1);
                console.log('--> registeredGroup03 disconnect: ' + socket.id + ' - ' + group03sockets.length);
            }
            else if (group04sockets.indexOf(socket) > -1) {
                group04sockets.splice(group04sockets.indexOf(socket), 1);
                console.log('--> registeredGroup04 disconnect: ' + socket.id + ' - ' + group04sockets.length);
            }

        });

        //add connect socket to group01 upon connection
        socket.on('registerGroup01', function (data) {
            group01sockets.push(socket);
            console.log('--> registeredGroup01 connection: ' + socket.id + ' - ' + group01sockets.length);
        });

        //add connect socket to group01 upon connection
        socket.on('registerGroup02', function (data) {
            group02sockets.push(socket);
            console.log('--> registeredGroup02 connection: ' + socket.id + ' - ' + group02sockets.length);
        });

        //add connect socket to group01 upon connection
        socket.on('registerGroup03', function (data) {
            group03sockets.push(socket);
            console.log('--> registeredGroup03 connection: ' + socket.id + ' - ' + group03sockets.length);
        });

        //add connect socket to group01 upon connection
        socket.on('registerGroup04', function (data) {
            group04sockets.push(socket);
            console.log('--> registeredGroup04 connection: ' + socket.id + ' - ' + group04sockets.length);
        });
    }
);

//Add the routes
require('./routes/instagramobject')(app, io);

//Shoutout to the console
console.log('--> Magic happens on port ' + port);


//Exhibit logic
var Instagramobject = require('./models/instagramobject.js');
var refreshInstagramIntervalInSeconds = '3000';
var idleModeIntervalInSeconds = '20000';
var reponseIntervalShort = '10000';
var reponseIntervalLong = '20000';

/*var exhibitTag = 'armu9876';
var preferredTags = ['tag1', 'tag2', 'tag3'];
var archiveTags = ['archivefrontjer', 'archivebackjer'];       */
/* var exhibitTag = 'architecture';
 var preferredTags = ['art', 'museum', 'beautiful'];
 var archiveTags = ['archivefrontjer', 'archivebackjer'];  */
/*var exhibitTag = 'paris';
var preferredTags = ['love', 'france', 'beautiful'];
var archiveTags = ['archivefrontjer', 'archivebackjer'];                     */

//main tag for the exhibit and instagram search
var exhibitTag = 'buildingideas1';
//preferred tags that application looks for within instgram contributions
var preferredTagsEnglish = ['interior', 'exterior', 'use'];
var preferredTagsNorwegian = ['interiør', 'exteriør', 'bruk'];
var preferredTags = preferredTagsEnglish + preferredTagsNorwegian;

//remember to update also in js/factories.js
var archiveTags = ['ar1'];

var idleModeTimer;
var idleModeIndex = 0;
var readyToUpdate = true;
var lastAddedIds = [];
var objectsToDatabase = [];
var displayQueue = [];
var idleModeOn = true;
var responseModeOn = false;
var safeguardTime = 0;

//function to extract the last added entries to mongo. only happens the server boots
getLastAddedEntryIds().then(function (result) {

    //loop through the result object and add the mongoids in the system
    for (var i = 0; i < result.length; i++) {
        lastAddedIds.push(result[i].entry_id);
    }

    setInterval(getFromInstagram, refreshInstagramIntervalInSeconds)
});

//function which gets the last 20 entries from instagram
function getFromInstagram() {
    requestify.request('https://api.instagram.com/v1/tags/' + exhibitTag + '/media/recent?client_id=feb2669024094d84b259de38d160e024', {
        method: 'GET',
        dataType: 'json'
    }).then(function (response) {
        if (response.code == 200) {
            //extract the result list as a JSON object
            var entriesList = response.getBody().data;
            var beforeSplice = entriesList.length;

            //loop through the result array
            for (var i = 0; i < entriesList.length; i++) {

                //look for the last added entry to the database
                if (lastAddedIds.indexOf(entriesList[i].id) > -1) {
                    //if found, delete the remaining entries from the array
                    entriesList.splice(i, Number.MAX_VALUE);
                    break;
                }
            }

            var afterSplice = entriesList.length;
            console.log('--> instagram array status: ' + beforeSplice + ' - ' + afterSplice + ' ====== ready to update: ' + readyToUpdate + ' ==== display queue: ' + displayQueue.length);

            //make sure the last array has been processed
            if (readyToUpdate && afterSplice > 0) {
                //lock the update process
                console.log('--> new entries found (' + afterSplice + ') - processing them');
                readyToUpdate = false;
                safeguardTime = 0;
                addNewInstagramEntries(entriesList);
            }
            else {
                /**
                 * if a problem occurs with the function 'addNewInstagramEntries'
                 * (for example if a field is missing in the JSON object returned from instagram),
                 * the variable 'readyToUpdate' will never be 'true' again. This means that no new entries
                 * will ever be written in our DB
                 *
                 * as a safeguard, it is wise to set a timer to force 'readyToUpdate' so that the system
                 * will
                 */

                /*safeguardTime = safeguardTime + refreshInstagramIntervalInSeconds;

                if (safeguardTime > 900000) {
                    //if no entries have been added for 15 mins, we force a readyToUpdate
                    safeguardTime = 0;
                    readyToUpdate = true;
                }     */

            }

        }
    });
};

//function that iterates through each new instgram entry creates as many mongo entries as there are tags.
function addNewInstagramEntries(arr) {
    console.log('--> addNewInstagramEntries - still to save:' + arr.length);
    if (arr.length > 0) {

        //pop the last entry from the list
        var newEntry = arr.pop();

        var instagramobject;
        var tag;
        var displayEntryNotAdded = true;
        var defaultEntry = null;

        //iterate through all the tags for that entry
        for (var i = 0; i < newEntry.tags.length; i++) {
            //assign the current tag to a variable
            tag = newEntry.tags[i];
            console.log('--> Tag detected: ' + tag);

            //instantiate a new instagram object based on mongoose model
            instagramobject = new Instagramobject();

            if (newEntry.id != null) instagramobject.entry_id = newEntry.id;
            if (newEntry.created_time != null) instagramobject.entry_created_time = newEntry.created_time;
            if (newEntry.type != null) instagramobject.entry_type = newEntry.type;
            if (newEntry.images.standard_resolution.url != null) instagramobject.entry_uri = newEntry.images.standard_resolution.url;
            if (newEntry.link != null) instagramobject.entry_link = newEntry.link;

            //user info
            if (newEntry.user != null) {
                if (newEntry.user.id != null) instagramobject.user_id = newEntry.user.id;
                if (newEntry.user.username != null) instagramobject.user_username = newEntry.user.username;
                if (newEntry.user.profile_picture != null) instagramobject.user_profile_picture = newEntry.user.profile_picture;
                if (newEntry.user.full_name != null) instagramobject.user_fullname = newEntry.user.full_name;
            }

            //caption info
            if (newEntry.caption != null) {
                if (newEntry.caption.id != null) instagramobject.caption_id = newEntry.caption.id;
                if (newEntry.caption.text != null) instagramobject.caption_text = newEntry.caption.text;
            }

            //tags info
            if (newEntry.tags != null) instagramobject.tags = newEntry.tags;

            //location info
            if (newEntry.location != null) {
                if (newEntry.location.location_id != null) instagramobject.location_id = newEntry.location.location_id;
                if (newEntry.location.name != null) instagramobject.location_name = newEntry.location.name;
                if (newEntry.location.latitude != null) instagramobject.location_lat = newEntry.location.latitude;
                if (newEntry.location.longitude != null) instagramobject.location_long = newEntry.location.longitude;
            }

            //toggle archive type field
            if (tag != null) instagramobject.custom_sortingtag = tag;
            if (newEntry.tags.indexOf(archiveTags[0]) > -1) instagramobject.custom_isfrontarchive = true;
            //no need for now, only dealing with archivefront - 01/09/2014
            //if (newEntry.tags.indexOf(archiveTags[1]) > -1) instagramobject.custom_isbackarchive = true;
            if (preferredTags.indexOf(tag) > -1) instagramobject.custom_ispreferredtag = true;

            if(tag == exhibitTag) {
                //store it in case there are no other tags
                defaultEntry = instagramobject;
            }

            if (preferredTags.indexOf(tag) > -1) {
                //if the array of tags contains one of the predefined tags
                objectsToDatabase.push(instagramobject);

                if(displayEntryNotAdded) {
                    //take the first predefined tag for the displayqueue
                    console.log('--> this entry contains a predefined tag, added to displaylist');
                    displayEntryNotAdded = false;
                    displayQueue.push(instagramobject);
                }
            }
        }

        if(displayEntryNotAdded) {
            //this entry does not contain any predefined tag => add default entry
            console.log('--> this entry does NOT contains a predefined tag, defaultEntry added to displaylist');
            objectsToDatabase.push(defaultEntry);
            displayQueue.push(defaultEntry);
        }

        if (displayQueue.length > 0) {
            eventEmitter.emit('queueListModified');
        }

        //add this new id at the beginning of the lastaddedids array
        lastAddedIds.unshift(newEntry.id);

        //to keep it to a size of 20, pop the extra ids
        if (lastAddedIds.length > 20) {
            lastAddedIds.splice(19, Number.MAX_VALUE);
        }

        addNewInstagramEntries(arr);
    }
    else {
        //flag ready-to-update to true
        //write any queued object to the database
        saveNewObjectsToDatabase();
    }
};

//function to write instgram entries to the DB
function saveNewObjectsToDatabase() {
    //make sure there is something to write to mongo
    console.log('--> Write array to DB (before): '+objectsToDatabase.length);
    if (objectsToDatabase.length > 0) {
        var objectToWrite = objectsToDatabase.pop();

        if(objectToWrite != undefined) {
            //save the object
            writeObjectToDB(objectToWrite).then(
                function (result) {
                    //check whether there is more to save
                    console.log('--> entry: ' + result._id + ' saved successfully');
                    saveNewObjectsToDatabase();
                },
                function (error) {
                    console.log('--> DB save error: ' + error);
                    saveNewObjectsToDatabase();

            });
        }
    }
    else {
        console.log('--> Ready for more updates');
        readyToUpdate = true;
    }
};

//function that takes in an array and return it shuffled
app.Shuffle = function (o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

app.GetStatus = function() {
    var status = {};
    status.exhibitTag = exhibitTag;
    status.englishTags = preferredTagsEnglish;
    status.norwegianTags = preferredTagsNorwegian;
    status.archiveTags = archiveTags;
    status.connectedGroup01 = {'count': group01sockets.length};
    status.connectedGroup02 = {'count': group02sockets.length};
    status.connectedGroup03 = {'count': group03sockets.length};
    status.connectedGroup04 = {'count': group04sockets.length};
    return status;
};

//listening for 'queueListModified' events
eventEmitter.on('queueListModified', function () {

    console.log('Queue list modified');
    idleModeOn = false;

    if (!responseModeOn) {
        processQueueList();
    }

});

//function that sends the queuelist items to the clients
function processQueueList() {
    //make sure the array has some elements and that the ipad are not already display a response
    if (displayQueue.length > 0 && !responseModeOn) {
        responseModeOn = true;
        var currentResponseEntry = displayQueue.shift();

        if(currentResponseEntry != null) {
            console.log('--> playResponseMode');
            //send the tag to ipad-GROUP01 a bit early (before mongo search)
            var translatedTagObject = getTranslatedTag(currentResponseEntry.custom_sortingtag);
            for (var i = 0; i < group01sockets.length; i++) {
                group01sockets[i].emit('group01Response', {'tag_EN': translatedTagObject.tag_EN, 'tag_NO': translatedTagObject.tag_NO});
            }

            var currentRandomArray = [];
            var archiveRandomArray = [];

            //create a new promise, in order to do things in sequence
            var newEntriesPromise;

            //check whether we deal with a preferred tag
            if (preferredTags.indexOf(currentResponseEntry.custom_sortingtag) > -1) {
                //that's one of them
                console.log('--> we deal with a preferred tag: '+currentResponseEntry.custom_sortingtag);
                newEntriesPromise = app.getNewEntriesWithTag(currentResponseEntry.custom_sortingtag);
            }
            else {
                //go for anything else
                console.log('--> we deal with the default exhibit tag: '+currentResponseEntry.custom_sortingtag);
                newEntriesPromise = app.getNewEntriesWithoutTag();
            }


            //when the promised is finished executing, start a new one for the second search
            newEntriesPromise.then(function (data) {
                    //assign the result of the promise to the currentRandomArray
                    currentRandomArray = data;

                    app.getArchiveEntriesWithTag(currentResponseEntry.custom_sortingtag).then(
                        function (data) {
                            //assign the result of the promise to the archiveRandomArray
                            archiveRandomArray = data;
                            console.log('--> we got so many archive entries from DB: '+archiveRandomArray.length);

                            playResponsePhase1(currentResponseEntry.custom_sortingtag, currentResponseEntry, currentRandomArray, archiveRandomArray);
                        }
                    );
                }
            );
        }
    }
};

//function to send information for phase 1 to all ipads
function playResponsePhase1(tag, entry, currentArray, archiveArray) {
    console.log('--> playing response mode PHASE 1');

    for (var j = 0; j < group02sockets.length; j++) {
        group02sockets[j].emit('group02Response', {'tag': tag, 'entry': entry});
    }

    for (var k = 0; k < group03sockets.length; k++) {
        group03sockets[k].emit('group03Response', {'tag': tag, 'entry': entry});
    }

    for (var l = 0; l < group04sockets.length; l++) {
        group04sockets[l].emit('group04Response', {'tag': tag, 'entry': entry});
    }

    if (displayQueue.length > 0) {
        //there are other entries in the queue, make it short
        setTimeout(function () {
            shortTimerFinished()
        }, reponseIntervalShort);
    }
    else {
        //no more entries ... good time
        setTimeout(function () {
            playResponsePhase2(tag, currentArray, archiveArray)
        }, reponseIntervalLong);
    }
};

//function to go another short loop in response mode
function shortTimerFinished() {
    responseModeOn = false;
    processQueueList();
};

//function to go another short loop in response mode
function playResponsePhase2(tag, currentArray, archiveArray) {
    for (var j = 0; j < group02sockets.length; j++) {
        group02sockets[j].emit('group02Response', {'tag': tag, 'entry': archiveArray.pop()});
    }

    for (var k = 0; k < group03sockets.length; k++) {
        group03sockets[k].emit('group03Response', {'tag': tag, 'entry': currentArray.pop()});
    }

    setTimeout(function () {
        longTimerFinished()
    }, reponseIntervalLong);
};

//function to either go another reponse mode loop or back to idle
function longTimerFinished() {
    //reponse mode is over now
    responseModeOn = false;

    if (displayQueue.length > 0) {
        //there might be new entries in the queue, loop again
        processQueueList();
    }
    else {
        //no more entries ... back to idle
        idleModeOn = true;
        playIdleMode();
    }

};


//function that send the idle mode pictures to the clients
function playIdleMode() {

    if (idleModeOn) {
        var idleModeTag = preferredTagsEnglish[idleModeIndex];
        console.log('--> playIdleMode');

        var currentRandomArray = [];
        var archiveRandomArray = [];

        //create a new promise, in order to do things in sequence
        var newEntriesPromise = app.getNewEntriesWithTag(idleModeTag);

        //when the promised is finished executing, start a new one for the second search
        newEntriesPromise.then(function (data) {
                //assign the result of the promise to the currentRandomArray
                currentRandomArray = data;

                app.getArchiveEntriesWithTag(idleModeTag).then(function (data) {
                        //assign the result of the promise to the archiveRandomArray
                        archiveRandomArray = data;

                        console.log('--> BEFORE: socket emit to all clients: TAG: current(' + currentRandomArray.length + ') - archive (' + archiveRandomArray.length + ')');
                        var translatedTagObject = getTranslatedTag(idleModeTag);

                        //then loop through the socket arrays and send correct item to various ipad groups
                        for (var i = 0; i < group01sockets.length; i++) {
                            group01sockets[i].emit('group01Idle', {'tag_EN': translatedTagObject.tag_EN, 'tag_NO': translatedTagObject.tag_NO});
                        }

                        for (var j = 0; j < group02sockets.length; j++) {
                            group02sockets[j].emit('group02Idle', {'tag': idleModeTag, 'entry': archiveRandomArray.pop()});
                        }

                        for (var k = 0; k < group03sockets.length; k++) {
                            group03sockets[k].emit('group03Idle', {'tag': idleModeTag, 'entry': currentRandomArray.pop()});
                        }

                        for (var l = 0; l < group04sockets.length; l++) {
                            group04sockets[l].emit('group04Idle', {'tag': idleModeTag, 'entry': currentRandomArray.pop()});
                        }

                        //increase the index to get the next preferred tag
                        if (idleModeIndex == preferredTagsEnglish.length - 1) {
                            idleModeIndex = 0;
                        }
                        else {
                            idleModeIndex = idleModeIndex + 1;
                        }

                        //loop one more time
                        console.log('--> looping after ' + idleModeIntervalInSeconds);
                        idleModeTimer = setTimeout(playIdleMode, idleModeIntervalInSeconds);
                    }
                );
            }
        );
    }
};

//function that returns a mongo search of the last 20 added entries
function getLastAddedEntryIds() {
    return new Promise(function (resolve, reject) {
        Instagramobject.find().sort({_id: 'desc'}).limit(20).exec(function (err, doc) {
            if (err) {
                reject(err);
            }
            else {
                resolve(doc);
            }
        });
    })
};

//function that returns a 'promised' shuffled array of all (non-archived) entries in mongo with a given tag
app.getNewEntriesWithTag = function(tag) {
    return new Promise(function (resolve, reject) {
            //translated tag holder variable
            var translatedTagObject = getTranslatedTag(tag);

            console.log('--> searching database for tag: ' + translatedTagObject.tag_EN +' or '+translatedTagObject.tag_NO);
            //first find all 'new' entries with specified tags, without archives
            Instagramobject.find({$or: [{ custom_sortingtag: translatedTagObject.tag_EN }, {custom_sortingtag: translatedTagObject.tag_NO}]}).where({custom_isfrontarchive: false}).where({custom_isbackarchive: false}).exec(function (err, instagramobjects) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(app.Shuffle(instagramobjects));
                }
            });
        }
    );
};

app.getNewEntriesWithoutTag = function() {
    return new Promise(function (resolve, reject) {
            console.log('--> searching database for any tag');
            //first find all 'new' entries without preferred tags, without archives
            Instagramobject.find().where({custom_ispreferredtag: false}).where({custom_isfrontarchive: false}).where({custom_isbackarchive: false}).exec(function (err, instagramobjects) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(app.Shuffle(instagramobjects));
                }
            });
        }
    );
};

//function that returns a 'promised' shuffled array of all archive (front) entries in mongo with a given tag
app.getArchiveEntriesWithTag = function(tag) {
    return new Promise(function (resolve, reject) {


        var translatedTagObject = getTranslatedTag(tag);

        console.log('--> searching database for tag: ' + translatedTagObject.tag_EN +' or '+translatedTagObject.tag_NO + ' and custom_isfrontarchive');
        //then find entries with specified tags, and archives front
        Instagramobject.find({$or: [{ custom_sortingtag: translatedTagObject.tag_EN }, {custom_sortingtag: translatedTagObject.tag_NO}]}).where({custom_isfrontarchive: true}).exec(function (err, instagramobjects) {
            if (err) {
                reject(err);
            }
            else {
                resolve(app.Shuffle(instagramobjects));
            }
        });
    })
};

//function that returns a tag for a newly posted entry
function writeObjectToDB(object) {
    return new Promise(function (resolve, reject) {
        object.save(function (err, product) {
            if (err) {
                reject(err);
            } else {
                resolve(product);
            }
        });

    })
};


function getTranslatedTag(tag) {
    //check if we are not dealing with exhibit tag
    if(tag == exhibitTag) {
        return {'tag_EN': tag,'tag_NO': tag};
    }
    else {
        //let's check which language the tag is
        if(preferredTagsEnglish.indexOf(tag) > -1) {
            //the tag is english
            for(var i = 0; i<preferredTagsEnglish.length; i++) {
                if(preferredTagsEnglish[i] == tag) {
                    return {'tag_EN': tag,'tag_NO': preferredTagsNorwegian[i]};
                    break;
                }
            }
        }
        else {
            //the tag is norwegian
            for(var i = 0; i<preferredTagsNorwegian.length; i++) {
                if(preferredTagsNorwegian[i] == tag) {
                    return {'tag_EN': preferredTagsEnglish[i],'tag_NO': tag};
                    break;
                }
            }
        }
    }




};
