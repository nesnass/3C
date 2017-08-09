"use strict";

exports.serverData = {
	mostRecentInstagramIds : [],
  mostRecentFacebookIds : []
};

exports.Constants = {
    MAIN_TAG: "framtidscampus",
    CRAWLER_REFRESH_INTERVAL_SECONDS: 60
};

exports.StatusMessages = {
    PING_OK: {
        status: 200,
        message: "Server alive"
    }
};


exports.MMSResponseMessages = [
	"Takk fra 3C for meldingen din!",
	"Flott! Sjekk participation-3c.herokuapp.com/testList for å se ditt bidrag",
	"Notert! Takk for at du bidro! Hilsen NTNU og Trondheim kommune",
	"Notert! Takk for at du bidro! Hilsen NTNU og Trondheim kommune. " +
	"For å få vite mer om campusprosjektet, se www.ntnu.no/campusutvikling. " +
	"Vil du vite mer om Trondheim kommunes stedsanalyse, se www.bycampus.no. " +
	"Vil du bli invitert til å bidra også til kommende medvirkningstiltak, send oss en e-post, campusutvikling@ntnu.no"
];
