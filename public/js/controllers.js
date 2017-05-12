var ArchimusAppControllers = angular.module("ArchimusAppControllers", ['ngAnimate', 'ngTouch']);

var overlayDelay = 5000;
var longReconnectDelay = 60000;

ArchimusAppControllers.controller("Group01Controller", function ($scope, $http, $timeout, socket) {
        //global vars for this controller
        $scope.group01ImageSource = "";
        $scope.group01TextEN = "";
        $scope.group01TextNO = "";
        $scope.group01PreloadTextNO = ""; //"#byggekunst";
        $scope.group01PreloadTextEN = ""; //"#buildingideas";
        $scope.showInfo = false;
        $scope.showTimeoutInfo = true;

        //register to the server when connecting
        socket.on('connect', function(data) {
                socket.startConnectionMonitor();
                socket.on('reconnect', function() {
                    console.info('Reconnected.');
                });
                socket.on('disconnect', function() {
                    console.info("Disconnected, attempting reconnect..");
                });
                socket.on('reconnect_failed', function() {
                    console.info("Reconnect failed.");
                });
                socket.emit('registerGroup01');
            }
        );

        //listen to the group01Idle socket event
        socket.on('group01Idle', function (data) {
            $scope.showTimeoutInfo = false;
            socket.stopConnectionMonitor();
            $scope.group01TextEN = $scope.group01PreloadTextEN;
            $scope.group01TextNO = $scope.group01PreloadTextNO;
            $scope.group01PreloadTextEN = '#' + data.tag_EN;
            $scope.group01PreloadTextNO = '#' + data.tag_NO;
        });

        //listen to the group01Response socket event
        socket.on('group01Response', function (data) {
            $scope.showTimeoutInfo = false;
            socket.stopConnectionMonitor();
            $scope.group01TextEN = '#' + data.tag_EN;
            $scope.group01TextNO = '#' + data.tag_NO;
        });

        // This fires if there are no idle or response events up to a certain time limit (defined in factories)
        $scope.$on('connectionTimeout', function() {
            $scope.showTimeoutInfo = true;
        });

        $scope.showOverlayOnTap = function() {
            if (!$scope.showInfo) {
                $scope.showInfo = true;
                $timeout(function () {
                    $scope.showInfo = false;
                }, overlayDelay);
            }
            else
                $scope.showInfo = false;
        }
    }
);

ArchimusAppControllers.controller("Group02Controller", function ($scope, $http, $timeout, socket, preloader, textoperations, httpoperations) {
        //global vars for this controller
        $scope.group02ImageSource = "";
        $scope.group02PreloadImageSource = "";
        $scope.group02Text = "";
        $scope.group02PreloadText = "";
        $scope.imageLocations = [];
        $scope.photo02one = "";
        $scope.photo02two = "";
        $scope.hideImage1 = false;
        $scope.hideImage2 = true;
        $scope.showInfo = false;
        $scope.showTimeoutInfo = true;

        //register to the server when connecting
        socket.on('connect', function(data) {
                socket.startConnectionMonitor();
                socket.on('reconnect', function() {
                    console.info('Reconnected.');
                });
                socket.on('disconnect', function() {
                    console.info("Disconnected, attempting reconnect..");
                });
                socket.on('reconnect_failed', function() {
                    console.info("Reconnect failed.");
                });
                socket.emit('registerGroup02');
            }
        );

        //listen to the group02Idle socket event
        socket.on('group02Idle', function (data) {
            socket.resetConnectionMonitor();
            if($scope.hideImage1) {
                $scope.photo02one = $scope.group02PreloadImageSource;
                $scope.showTimeoutInfo = false;
                $scope.hideImage1 = false;
                $scope.hideImage2 = true;
            }
            else {
                $scope.photo02two = $scope.group02PreloadImageSource;
                $scope.hideImage2 = false;
                $scope.hideImage1 = true;
            }
            $scope.group02Text = $scope.group02PreloadText;

            if(data.entry != null) {
                $scope.group02PreloadText = data.entry;
                $scope.imageLocations = [data.entry.entry_uri];
                preloadNextImage(data.entry);
            }
            else {
                console.info("Null entry, the database is probably not big enough");
            }
        });

        $scope.showOverlayOnTap = function() {
            if (!$scope.showInfo) {
                $scope.showInfo = true;
                $timeout(function () {
                    $scope.showInfo = false;
                }, overlayDelay);
            }
            else
                $scope.showInfo = false;
        };

        $scope.heightadjust = function () {
            return ($scope.group02Text.location_name === undefined);
        };

        //picture preloading function
        function preloadNextImage(preloadingImageObject) {
            // Preload the images; then, update display when returned.
            preloader.preloadImages($scope.imageLocations).then(

                function handleResolve(imageLocations) {

                    $scope.group02PreloadImageSource = imageLocations[0];
                    console.info("Preload Successful");

                },
                function handleReject(imageLocation) {

                    // Loading failed on at least one image.
                    console.error("Image Failed", imageLocation);
                    console.info("Preload Failure");

                    //the image has been deleted from Instagram, delete the cache entry
                    httpoperations.doDeleteURL('/instagramobject/'+preloadingImageObject._id).then(function (response) {
                        //fetch a new image to preload with the same tag
                        httpoperations.doGetURL('/instagramobject/archivewithtag/'+preloadingImageObject.custom_sortingtag).then(function (response) {
                            if(response[1] == 200) {
                                $scope.group02PreloadText = response[0].entry;
                                $scope.imageLocations = [response[0].entry.entry_uri];
                                preloadNextImage(response[0].entry);
                            }
                        });
                    });

                },
                function handleNotify(event) {

                    $scope.percentLoaded = event.percent;
                    console.info("Percent loaded:", event.percent);

                }
            );
        }

        //listen to the group02Response socket event
        socket.on('group02Response', function (data) {
            $scope.showTimeoutInfo = false;
            socket.resetConnectionMonitor();
            if($scope.hideImage1 == false) {
                $scope.photo02one = data.entry.entry_uri;
               // $scope.hideImage1 = true;
               // $scope.hideImage2 = false;
            }
            else {
                $scope.photo02two = data.entry.entry_uri;
               // $scope.hideImage2 = true;
               // $scope.hideImage1 = false;
            }
            $scope.group02Text = data.entry;
        });

        // This fires if there are no idle or response events up to a certain time limit (defined in factories)
        $scope.$on('connectionTimeout', function() {
            $scope.showTimeoutInfo = true;
        });

        //function that adds a class around the #tags so that they can be styled
        $scope.getFormattedCaption = function(caption) {
            return textoperations.getFormattedCaption(caption);
        };
    }
);

ArchimusAppControllers.controller("Group03Controller", function ($scope, $http, $timeout, socket, preloader, textoperations, httpoperations) {

        //global vars for this controller
        $scope.group03ImageSource = "";
        $scope.group03PreloadImageSource = "";
        $scope.group03Text = "";
        $scope.group03PreloadText = "";
        $scope.imageLocations = [];
        $scope.photo03one = "";
        $scope.photo03two = "";
        $scope.hideImage1 = false;
        $scope.hideImage2 = true;
        $scope.showInfo = false;
        $scope.showTimeoutInfo = true;

        //register to the server when connecting
        socket.on('connect', function(data) {
                socket.startConnectionMonitor();
                socket.on('reconnect', function() {
                    console.info('Reconnected.');
                });
                socket.on('disconnect', function() {
                    console.info("Disconnected, attempting reconnect..");
                });
                socket.on('reconnect_failed', function() {
                    console.info("Reconnect failed.");
                });
                socket.emit('registerGroup03');
            }
        );

        $scope.heightadjust = function () {
           return ($scope.group03Text.location_name === undefined);
        };

        socket.on('reconnect_failed', function(data) {
            $timeout(function() {
                socket.connect();
            }, longReconnectDelay )
        });

        //listen to the group03Idle socket event
        socket.on('group03Idle', function (data) {
            socket.resetConnectionMonitor();
            if($scope.hideImage1) {
                $scope.photo03one = $scope.group03PreloadImageSource;
                $scope.showTimeoutInfo = false;
                $scope.hideImage1 = false;
                $scope.hideImage2 = true;
            }
            else {
                $scope.photo03two = $scope.group03PreloadImageSource;
                $scope.hideImage2 = false;
                $scope.hideImage1 = true;
            }
            $scope.group03Text = $scope.group03PreloadText;

            if(data.entry != null) {
                $scope.group03PreloadText = data.entry;
                $scope.imageLocations = [data.entry.entry_uri];
                preloadNextImage(data.entry);
            }
            else {
                console.info("Null entry, the database is probably not big enough");
            }
        });

        // Server commands client to save the screen. Objective C code can intercept this redirect
    /*    socket.on('allGroupsSleep', function (data) {
            $window.location.href = 'screensave://';
        }); */
        // Server commands client to resume display. Objective C code can intercept this redirect
    /*    socket.on('allGroupsWake', function (data) {
            $scope.$apply(function() { $location.path("/group03"); $route.reload(); });
        }); */

        $scope.showOverlayOnTap = function() {
            if (!$scope.showInfo) {
                $scope.showInfo = true;
                $timeout(function () {
                    $scope.showInfo = false;
                }, overlayDelay);
            }
            else
                $scope.showInfo = false;
        };

        //picture preloading function
        function preloadNextImage(preloadingImageObject) {
            // Preload the images; then, update display when returned.
            preloader.preloadImages($scope.imageLocations).then(

                function handleResolve(imageLocations) {
                    $scope.group03PreloadImageSource = imageLocations[0];
                    console.info("Preload Successful");
                },
                function handleReject(imageLocation) {

                    // Loading failed on at least one image.
                    console.error("Image Failed", imageLocation);
                    console.info("Preload Failure");

                    //the image has been deleted from Instagram, delete the cache entry
                    httpoperations.doDeleteURL('/instagramobject/'+preloadingImageObject._id).then(function (response) {
                        //fetch a new image to preload with the same tag
                        httpoperations.doGetURL('/instagramobject/newwithtag/'+preloadingImageObject.custom_sortingtag).then(function (response) {
                            if(response[1] == 200) {
                                $scope.group03PreloadText = response[0].entry;
                                $scope.imageLocations = [response[0].entry.entry_uri];
                                preloadNextImage(response[0].entry);
                            }
                        });
                    });
                },
                function handleNotify(event) {

                    $scope.percentLoaded = event.percent;
                    console.info("Percent loaded:", event.percent);

                }
            );
        }

        //listen to the group03Response socket event
        socket.on('group03Response', function (data) {
            $scope.showTimeoutInfo = false;
            socket.resetConnectionMonitor();
            $scope.group03Text = data.entry;
            if($scope.hideImage1 == false) {
                $scope.photo03one = data.entry.entry_uri;
             //   $scope.hideImage1 = true;
             //   $scope.hideImage2 = false;
            }
            else {
                $scope.photo03two = data.entry.entry_uri;
             //   $scope.hideImage2 = true;
             //   $scope.hideImage1 = false;
            }
        });

        // This fires if there are no idle or response events up to a certain time limit (defined in factories)
        $scope.$on('connectionTimeout', function() {
            $scope.showTimeoutInfo = true;
        });

        //function that adds a class around the #tags so that they can be styled
        $scope.getFormattedCaption = function(caption) {
            return textoperations.getFormattedCaption(caption);
        };
    }
);

ArchimusAppControllers.controller("Group04Controller", function ($scope, $http, $timeout, socket, preloader, textoperations, httpoperations) {
        //global vars for this controller
        $scope.group04ImageSource = "";
        $scope.group04PreloadImageSource = "";
        $scope.group04Text = "";
        $scope.group04PreloadText = "";
        $scope.imageLocations = [];
        $scope.photo04one = "";
        $scope.photo04two = "";
        $scope.hideImage1 = false;
        $scope.hideImage2 = true;
        $scope.showInfo = false;
        $scope.showTimeoutInfo = true;

        //register to the server when connecting
        socket.on('connect', function(data) {
                socket.startConnectionMonitor();
                socket.on('reconnect', function() {
                    console.info('Reconnected.');
                });
                socket.on('disconnect', function() {
                    console.info("Disconnected, attempting reconnect..");
                });
                socket.on('reconnect_failed', function() {
                    console.info("Reconnect failed.");
                });
                socket.emit('registerGroup04');
            }
        );

        socket.on('reconnect_failed', function(data) {
            $timeout(function() {
                socket.connect();
            }, longReconnectDelay )
        });

        //listen to the group04Idle socket event
        socket.on('group04Idle', function (data) {
            socket.resetConnectionMonitor();
            if($scope.hideImage1) {
                $scope.photo04one = $scope.group04PreloadImageSource;
                $scope.showTimeoutInfo = false;
                $scope.hideImage1 = false;
                $scope.hideImage2 = true;
            }
            else {
                $scope.photo04two = $scope.group04PreloadImageSource;
                $scope.hideImage2 = false;
                $scope.hideImage1 = true;
            }
            $scope.group04Text = $scope.group04PreloadText;

            if(data.entry != null) {
                $scope.group04PreloadText = data.entry;
                $scope.imageLocations = [data.entry.entry_uri];
                preloadNextImage(data.entry);
            }
            else {
                console.info("Null entry, the database is probably not big enough");
            }
        });

        $scope.heightadjust = function () {
            return ($scope.group04Text.location_name === undefined);
        };

        $scope.showOverlayOnTap = function() {
            if (!$scope.showInfo) {
                $scope.showInfo = true;
                $timeout(function () {
                    $scope.showInfo = false;
                }, overlayDelay);
            }
            else
                $scope.showInfo = false;
        };

        //picture preloading function
        function preloadNextImage(preloadingImageObject) {
            // Preload the images; then, update display when returned.
            preloader.preloadImages($scope.imageLocations).then(

                function handleResolve(imageLocations) {

                    $scope.group04PreloadImageSource = imageLocations[0];
                    console.info("Preload Successful");

                },
                function handleReject(imageLocation) {

                    // Loading failed on at least one image.
                    console.error("Image Failed", imageLocation);
                    console.info("Preload Failure");

                    //the image has been deleted from Instagram, delete the cache entry
                    httpoperations.doDeleteURL('/instagramobject/'+preloadingImageObject._id).then(function (response) {
                        //fetch a new image to preload with the same tag
                        httpoperations.doGetURL('/instagramobject/newwithtag/'+preloadingImageObject.custom_sortingtag).then(function (response) {
                            if(response[1] == 200) {
                                $scope.group04PreloadText = response[0].entry;
                                $scope.imageLocations = [response[0].entry.entry_uri];
                                preloadNextImage(response[0].entry);
                            }
                        });
                    });

                },
                function handleNotify(event) {

                    $scope.percentLoaded = event.percent;
                    console.info("Percent loaded:", event.percent);

                }
            );
        }

        //listen to the group04Response socket event
        socket.on('group04Response', function (data) {
            $scope.showTimeoutInfo = false;
            socket.resetConnectionMonitor();
            $scope.group04Text = data.entry;
            if($scope.hideImage1 == false) {
                $scope.photo04one = data.entry.entry_uri;
            //    $scope.hideImage1 = true;
            //    $scope.hideImage2 = false;
            }
            else {
                $scope.photo04two = data.entry.entry_uri;
            //    $scope.hideImage2 = true;
            //    $scope.hideImage1 = false;
            }
        });

        // This fires if there are no idle or response events up to a certain time limit (defined in factories)
        $scope.$on('connectionTimeout', function() {
            $scope.showTimeoutInfo = true;
        });

        //function that adds a class around the #tags so that they can be styled
        $scope.getFormattedCaption = function(caption) {
            return textoperations.getFormattedCaption(caption);
        };
    }
);