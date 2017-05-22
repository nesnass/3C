"use strict";

exports.serverData = {
	mostRecentInstagramIds : []
};

exports.Constants = {
    MAIN_TAG: "exterior",
    INSTAGRAM_REFRESH_INTERVAL_SECONDS: 60
};

exports.StatusMessages = {
    PING_OK: {
        status: 200,
        message: "Server alive"
    }
};


exports.MMSResponseMessages = [
	"Takk fra 3C for meldingen din!",
	"Flott! Sjekk participation-3c.herokuapp.com/testList for å se ditt bidrag"
];