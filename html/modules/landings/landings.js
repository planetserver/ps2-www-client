/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @version $Id: BasicExample.js 3320 2015-07-15 20:53:05Z dcollins $
 */
/* Global variables */
ps2EndPoint = "http://access.planetserver.eu/";
ps2WCPSEndPoint = "http://access.planetserver.eu:8080/rasdaman/ows?service=WCS&version=2.0.1&request=ProcessCoverages&query=";
ps2StretchWCPSEndPoint = "http://access.planetserver.eu:8090/python?wcpsQuery=";

checkedFootPrintsArray = []; // array of footprints that user choosed

containedFootPrintsArray = []; // array of footprints which contain the point which user right click

hightlightedFootPrintsArray = []; // array of footprints which are hightlighted

toppedFootPrintsArray = []; // array of footprints which are topped

lastCovID = ""; // last footprint which contains clicked point (it does not need to be the last index of checkedFootPrintArray)

leftClickFootPrintsArray = []; // store all the footprints when left click (each time click on at least 1 footprint)

shapesLayer = ""; // layer contains all footprints shapes

renderLayer = [];

// add the tile footprints in moon client when load multi temporary footprints
renderLayerTiles = [];

isInitMenuContext = false;

// this function is loaded in rgb_combinations.js for RGB Bands
loadDropDownRGBBands = "";

// this function is loaded in rgb_combinations.js for WCPS Bands
loadDropDownWCPSBands = "";

// blue
checkedAttributes = "";

// yellow
selectedAttributes = ""; // it is selected to load RGB Bands

// hightlight
hightlightedAttributes = "";

// red
defaultAttributes = "";

// Global variable web world wind
wwd = null;

// place x icon on footprint
placemarkLayer = null;

// the last clicked point
placemark = null;

// which coverageID is used to draw map
drawCoverageID = "";
drawLat = "";
drawLon = "";


// the clicked coordinate
clickedLatitude = 0;
clickedLongitude = 0;

MOON_TILE_NUMBER = 3;

// which dock is allowed to open (default chartDock is opened then to open another dock, such as radioDock, need to close chartDock first)
currentOpenDock = "";

// 2 markers for band ratio chart
placeMarkersBandRatio = [{
    name: "numerator",
    iconPath: "html/images/icons/numer.png",
    latitude: "",
    longitude: "",
    layer: null
}, {
    name: "denominator",
    iconPath: "html/images/icons/denom.png",
    latitude: "",
    longitude: "",
    layer: null
}];

var clientName = "mars";

$(function() {
    var url = window.location.href;
    if (url.indexOf("moon") > -1) {
        clientName = "moon";
    } else {
        clientName = "mars";
    }
});


function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return "";
}

var qsParam = {
    lat: getQueryVariable("lat"),
    lon: getQueryVariable("lon"),
    range: getQueryVariable("range"),
    covID: getQueryVariable("covName")
};

// default it only allow 7 seconds to load libraries, it will wait until all libaries load with out set seconds
requirejs.config({
    waitSeconds: 0
});

// Load dependent libraries
requirejs(['../../config/config',
        '../../libs/web-world-wind/WorldWind',
        '../coordinate-controller/CoordinateController',
        '../../libs/web-world-wind/navigate/Navigator',
        '../layer-manager/LayerManager',
        '../foot-prints/foot-prints',
        '../tour/tour',
        '../rgb-combinator/rgb-combinator',
        '../menu-context/menu-context',
        '../charts/main-chart',
        '../charts/ratio-chart',
        '../goto/goto',
        '../band-ratio/band-ratio',
        '../charts/chart',
        '../spectral-library/spectral-library'
    ],
    function(config,
        ww,
        CoordinateController,
        Navigator,
        LayerManager,
        Footprints,
        tour,
        rgb_combination,
        menu_context,
        main_chart,
        ratio_chart,
        go_to,
        band_ratio,
        chart,
        spectral_library) {
        "use strict";

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);
        wwd = new WorldWind.WorldWindow("canvasOne");

        var layers = null;

        var baseMapName = "";

        if (clientName === "mars") {
            // Mars
            layers = [{
                // this is colorful base map
                layer: new WorldWind.BMNGLayer("mars_MOLA_color"),
                enabled: false
            }, {
                // this is dark base map
                layer: new WorldWind.BMNGLayer("mars_wgs84"),
                enabled: true
            }];

            baseMapName = "mars_wgs84";
        } else {
            // Moon
            layers = [{
                // this is colorful base map
                layer: new WorldWind.BMNGLayer("moon_LOLA_color"),
                enabled: false
            }, {
                // this is dark base map
                layer: new WorldWind.BMNGLayer("moon_wgs84"),
                enabled: true
            }];

            baseMapName = "moon_wgs84";
        }


        // Only load 1 base map at start
        var baseMapLayer = layers[1].layer;
        var baseMapIndex = 0;

        wwd.insertLayer(0, baseMapLayer);

        //======================WMS layer selector======
        $("#basemapsDropdown").find(" li").on("click", function(e) {
            var index = -1;
            var selectedBaseMapName = $(this).children().html();
            var isLoadedBaseMap = true;

            if (clientName === "mars") {
                // colorful base map
                if (selectedBaseMapName === "MOLA Colored") {
                    if (baseMapName !== selectedBaseMapName) {
                        index = 0;
                        baseMapName = "MOLA Colored";
                        isLoadedBaseMap = false;
                    }
                } else if (selectedBaseMapName === "Viking Mosaic") {
                    if (baseMapName !== selectedBaseMapName) {
                        index = 1;
                        baseMapName = "Viking Mosaic";
                        isLoadedBaseMap = false;
                    }

                }
            } else if (clientName === "moon") {
                if (selectedBaseMapName === "LOLA color") {
                    if (baseMapName !== selectedBaseMapName) {
                        index = 0;
                        baseMapName = "LOLA color";
                        isLoadedBaseMap = false;
                    }
                } else if (selectedBaseMapName === "Moon") {
                    if (baseMapName !== selectedBaseMapName) {
                        index = 1;
                        baseMapName = "Moon";
                        isLoadedBaseMap = false;
                    }

                }
            }



            // no load the same base map again
            if (!isLoadedBaseMap) {

                // remove old layer and insert a new one
                wwd.removeLayer(baseMapLayer);

                // load the new base map layer
                baseMapLayer = layers[index].layer;
                wwd.insertLayer(--baseMapIndex, baseMapLayer);
            }
        });

        // Create a layer to hold the surface shapes.
        shapesLayer = new WorldWind.RenderableLayer("");

        // Create and set attributes for it. The shapes below except the surface polyline use this same attributes
        // object. Real apps typically create new attributes objects for each shape unless they know the attributes
        // can be shared among shapes.
        defaultAttributes = new WorldWind.ShapeAttributes(null);
        defaultAttributes.outlineColor = WorldWind.Color.RED;
        defaultAttributes.drawInterior = false;

        checkedAttributes = new WorldWind.ShapeAttributes(null);
        checkedAttributes.outlineColor = WorldWind.Color.BLUE;
        checkedAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
        checkedAttributes.drawInterior = false;


        selectedAttributes = new WorldWind.ShapeAttributes(null);
        selectedAttributes.outlineColor = WorldWind.Color.YELLOW;
        selectedAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
        selectedAttributes.drawInterior = false;


        hightlightedAttributes = new WorldWind.ShapeAttributes(null);
        hightlightedAttributes.outlineColor = WorldWind.Color.GREEN;
        hightlightedAttributes.outlineWidth = 1.5;
        hightlightedAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
        hightlightedAttributes.drawInterior = false;


        //Adding allFootPrintsArray
        var boundaries = []; // array for boundary locations of the footprints
        for (var i = 0; i < allFootPrintsArray.length; i++) {
            boundaries.push([]); // new array for the boundaries of a single footprint
            for (var j = 0; j < allFootPrintsArray[i].latList.length; j++) {
                // adding all the boundaries of a single polygon into boundaries[i]
                boundaries[i].push(new WorldWind.Location(allFootPrintsArray[i].latList[j], allFootPrintsArray[i].longList[j]));
            }

            shapes[i] = new WorldWind.SurfacePolygon(boundaries[i], defaultAttributes);
            shapes[i]._displayName = allFootPrintsArray[i].coverageID; // setting the exact name of the polygon into _displayName

            shapesLayer.addRenderable(shapes[i]);
        }

        // this is all footprints
        wwd.insertLayer(2, shapesLayer);


        /* This function will check if user click on globe or click on loaded image for footprint:
            + If click on globe then check if it is inside a footprint. If it is then add these footprints to checkedFootPrintsArray
            + If click on loaded image then draw the chart which contains the values of all bands for the clicked point
        */
        var layerRecognizer = function(o) {
            // X and Y coordinates of a single click
            var x = o.clientX,
                y = o.clientY;
            //console.log("The coordinates are: " + x + " " + y);
            var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

            if (pickList.objects[0] != null) {
                // Get the clicked point (if it clicks on the globe then use object[0] or click on loaded image then use object[1])
                clickedLatitude = pickList.objects[0].position != null ? pickList.objects[0].position.latitude : pickList.objects[1].position.latitude;
                clickedLongitude = pickList.objects[0].position != null ? pickList.objects[0].position.longitude : pickList.objects[1].position.longitude;

                // get last footprint which contains the new clicked point (load image by synchronous)
                $.when(getFootPrintsContainingPointLeftClick(shapes, defaultAttributes, checkedAttributes, clickedLatitude, clickedLongitude)).then(function() {

                    // set the latitude, longitude to goto panel
                    //$("#txtLatitudeGoTo").val(clickedLatitude);
                    //$("#txtLongitudeGoTo").val(clickedLongitude);

                    // Generate a link to access to coverageID and/or Latitude and Longitude
                    var link = ps2EndPoint + "index.html?";

                    if (leftClickFootPrintsArray.length !== 0) {
                        link = link + "covName=" + leftClickFootPrintsArray[0].coverageID;
                    }

                    if (clickedLatitude != "" && clickedLongitude != "") {
                        link = link + "&lat=" + clickedLatitude;
                        link = link + "&lon=" + clickedLongitude;
                    }

                    link = link + "&range=" + wwd.navigator.range;

                    // add link to goto panel
                    $("#linkGoTo").attr("href", link);
                    $("#linkGoTo").text(link);



                    /*// Put placemark, remove the last clicked point
                    if (placemarkLayer != null) {
                        wwd.removeLayer(placemarkLayer);
                    }*/

                    // When to add the clicked icon
                    handlePlaceMarkerLayer();

                    // If click outside of footprint then not draw chart
                    if (leftClickFootPrintsArray.length === 0) {
                        return;
                    }

                    // Get the first coverageID to goto panel
                    // $("#txtCoverageIDGoTo").val(leftClickFootPrintsArray[0].coverageID);


                    console.log("Found containing footprints now check to draw chart.");
                    // if click on loaded image then draw chart
                    if (pickList.objects[1] != null) {

                        // no draw anything if not selected chart dock
                        if (currentOpenDock === "") {
                            return;
                        }

                        console.log("Draw chart on coverageID: " + lastCovID);
                        // then it will load the array of values for all the bands which contains the clicked point and draw the chart

                        // There are 2 cases here:
                        // + Click on unhightlighted footprints then it will get the lastCoverage and get values on this footprint
                        // + Click on unhightlighted footprint intersecting with hightlighted footprint, then it will get values from hightlighted footprints
                        var isClickOnHightLight = false;

                        // Store all the hightlightedFootprints which are returned from leftClickFootPrintsArray
                        var hightlightedFootPrintsTmp = [];

                        // the priority is top of hightlightedFootPrintsArray first
                        for (var i = hightlightedFootPrintsArray.length - 1; i >= 0; i--) {
                            var hightlightedCoverageID = hightlightedFootPrintsArray[i].coverageID;

                            // check if any hightlighted footprints are in the returning footprints from left click
                            for (var j = 0; j < leftClickFootPrintsArray.length; j++) {
                                var coverageID = leftClickFootPrintsArray[j].coverageID;

                                if (hightlightedCoverageID === coverageID) {
                                    // then the top highlighted footprint is used to get the data
                                    lastCovID = hightlightedCoverageID;
                                    isClickOnHightLight = true;

                                    // Add this footprint to hightlightedFootPrintsTmp
                                    hightlightedFootPrintsTmp.push(coverageID);
                                }
                            }
                        }

                        // If not then just get the last clicked footprint from the left clicked footprints array
                        if (!isClickOnHightLight) {
                            lastCovID = leftClickFootPrintsArray[leftClickFootPrintsArray.length - 1].coverageID;
                        } else {
                            // Here is all hightlighted coverages which are inside the leftClickFootPrintsArray
                            // Get the index of these elements inside hightlightedFootPrintsArray
                            var topIndex = 0;

                            console.log(" Hightlighted Footprints Tmp: ");
                            console.log(hightlightedFootPrintsTmp);

                            console.log(" Hightlighted Footprins: ");
                            console.log(hightlightedFootPrintsArray);


                            for (var i = 0; i < hightlightedFootPrintsTmp.length; i++) {
                                var covTmp1 = hightlightedFootPrintsTmp[i];

                                for (var j = 0; j < hightlightedFootPrintsArray.length; j++) {

                                    var covTmp2 = hightlightedFootPrintsArray[j].coverageID;
                                    if (covTmp1 === covTmp2) {
                                        // get the index of hightlighted footprint in hightlightedFootPrints
                                        if (topIndex < j) {
                                            topIndex = j;
                                        }
                                    }
                                }
                            }

                            // Then lastCov is the coverage at topIndex
                            lastCovID = hightlightedFootPrintsArray[topIndex].coverageID;
                        }

                        // Get the metadata of footprint and make query builder on the correct order footprint
                        var index = 0;
                        for (var i = 0; i < checkedFootPrintsArray.length; i++) {
                            if (checkedFootPrintsArray[i].coverageID === lastCovID) {
                                index = i;
                                break;
                            }
                        }

                        queryBuilder(clickedLatitude, clickedLongitude, lastCovID, checkedFootPrintsArray[index].Easternmost_longitude, checkedFootPrintsArray[index].Westernmost_longitude, checkedFootPrintsArray[index].centroid_longitude);
                    }
                });
            }
        };

        /* This function is called from landing.js after all checked footprints are updated to checkedFootPrintsArray
        and it loads the image accordingly to checked footprints
        */
        var imagesLayer = null;

        // Check to update WCPS query when load RGB combinations
        function updateDownloadWCPSQuery(coverageID, wcpsQueryLink) {
            for (var j = 0; j < checkedFootPrintsArray.length; j++) {
                if (checkedFootPrintsArray[j].coverageID.toLowerCase() === coverageID.toLowerCase()) {
                    checkedFootPrintsArray[j].wcpsQuery = wcpsQueryLink;
                    return;
                }
            }
        }

        window.accessCheckedFootPrintsArray = function(newClickedFootPrintsArray) {

            // Remove the old layers first
            //wwd.removeLayer(imagesLayer);
            if (imagesLayer == null) {
                imagesLayer = new WorldWind.RenderableLayer("");
                // Add the new one
                wwd.insertLayer(3, imagesLayer);
            }

            for (var i = 0; i < checkedFootPrintsArray.length; i++) {
                // check if coverageID is new checked then load default image on this
                var coverageID = checkedFootPrintsArray[i].coverageID.toLowerCase();

                // only load default image on the new checked footprints in newClickedFootPrintsArray
                if (checkedFootPrintsArray.length > 1 && newClickedFootPrintsArray.indexOf(coverageID) === -1) {
                    // Check if the existing footprint has loaded any image first
                    if (checkedFootPrintsArray[i].isLoadedImage) {
                        continue;
                    }
                };

                var maxlong;
                var minlong;
                //  console.log("Checked Footprint: " + i + " ");
                //  console.log("east lat1: " + checkedFootPrintsArray[i].Easternmost_longitude);
                // console.log("west lat1: " + checkedFootPrintsArray[i].Westernmost_longitude);
                maxlong = checkedFootPrintsArray[i].Easternmost_longitude; //assign maxlong from the checked footprint
                minlong = checkedFootPrintsArray[i].Westernmost_longitude; //assign minlong from the checked footprint
                if (checkedFootPrintsArray[i].Easternmost_longitude > 180) { //long in www spans from -180 to 180, if its bigger than 180 = -360
                    maxlong = checkedFootPrintsArray[i].Easternmost_longitude - 360;
                    //  console.log("max lon: " + maxlong);
                }
                if (checkedFootPrintsArray[i].Westernmost_longitude > 180) {
                    minlong = checkedFootPrintsArray[i].Westernmost_longitude - 360;
                    //  console.log("min lon: " + minlong);
                } else {
                    maxlong = checkedFootPrintsArray[i].Easternmost_longitude; //if long is in between -180/180 then assgin the original longs
                    minlong = checkedFootPrintsArray[i].Westernmost_longitude;
                }

                checkedFootPrintsArray[i].isLoadedImage = true;
                // If just use http://access.planetserver.eu:8080/rasdaman/ows?query it will have error NULL
                // Load default bands for all footprints
                if (clientName === "mars") {
                    var WCPSLoadImage = ps2WCPSEndPoint + 'for data in (' + coverageID + ') return encode( { red: ' + redBandDefault + '; green: ' + greenBandDefault + '; blue: ' + blueBandDefault + ' ; alpha: ' + alphaBandDefault + '}, "png", "nodata=65535")';
                    var surfaceImage = new WorldWind.SurfaceImage(new WorldWind.Sector(checkedFootPrintsArray[i].Minimum_latitude, checkedFootPrintsArray[i].Maximum_latitude, minlong, maxlong), WCPSLoadImage);


                    console.log("Load default image on footprint: " + coverageID);

                    renderLayer[i] = new WorldWind.RenderableLayer("");
                    renderLayer[i].addRenderable(surfaceImage);

                    // Add the loaded image in images layer
                    imagesLayer.addRenderable(renderLayer[i]);

                    // Add footprint and query to download option in menu context
                    updateDownloadWCPSQuery(coverageID, WCPSLoadImage);
                } else if (clientName === "moon") {
                    // create WCPS queries by subsettings then load in another footprints
                    var WCPSLoadImageTemplate = 'http://access.planetserver.eu:8080/rasdaman/ows?service=WCS&version=2.0.1&request=ProcessCoverages&query=for data in ( $coverageID ) return encode( { red: (float)(((int)(255 / (max((data).band_10) - min((data).band_10))) * ((data).band_10 - min((data).band_10))))[N( $minN$newN )]; green: (float)(((int)(255 / (max((data).band_13) - min((data).band_13))) * ((data).band_13 - min((data).band_13))))[N( $minN$newN )]; blue: (float)(((int)(255 / (max((data).band_78) - min((data).band_78))) * ((data).band_78 - min((data).band_78))))[N( $minN$newN )] ; alpha: (float)((((data).band_85 > 0) * 255))[N( $minN$newN )]}, "png", "nodata=65535")';
                    loadSubsettingsWCPSQuery(WCPSLoadImageTemplate, i, minlong, maxlong);

                    // Add footprint and query to download option in menu context
                    var WCPSLoadImage = 'http://access.planetserver.eu:8080/rasdaman/ows?service=WCS&version=2.0.1&request=ProcessCoverages&query=for data in ( $coverageID ) return encode( { red: (float)(((int)(255 / (max((data).band_10) - min((data).band_10))) * ((data).band_10 - min((data).band_10)))); green: (float)(((int)(255 / (max((data).band_13) - min((data).band_13))) * ((data).band_13 - min((data).band_13)))); blue: (float)(((int)(255 / (max((data).band_78) - min((data).band_78))) * ((data).band_78 - min((data).band_78)))) ; alpha: (float)((((data).band_85 > 0) * 255))}, "png", "nodata=65535")';
                    WCPSLoadImage = WCPSLoadImage.replace("$coverageID", coverageID.toUpperCase());
                    updateDownloadWCPSQuery(coverageID, WCPSLoadImage);
                }
            }
        }

        // this function will load a RGB combination image from rgbcombination.js to selected footprint from selected comboBox
        // mars client
        window.loadRGBCombinationsMars = function(WCPSLoadImage, coverageID, stretch) {
            // If stretch is true then need to use Python stretch.py to stretch
            //alert(WCPSLoadImage);
            WCPSLoadImage = ps2WCPSEndPoint + WCPSLoadImage;

            if (stretch) {
                // Use Python web service to stretch WCPS queries
                WCPSLoadImage = ps2StretchWCPSEndPoint + WCPSLoadImage;
            }

            for (var i = 0; i < checkedFootPrintsArray.length; i++) {
                var maxlong;
                var minlong;
                // only load RGB Combinations to the selected footprint from selected comboBox
                if (checkedFootPrintsArray[i].coverageID.toLowerCase() === coverageID) {
                    maxlong = checkedFootPrintsArray[i].Easternmost_longitude; //assign maxlong from the checked footprint
                    minlong = checkedFootPrintsArray[i].Westernmost_longitude; //assign minlong from the checked footprint
                    if (checkedFootPrintsArray[i].Easternmost_longitude > 180) { //long in www spans from -180 to 180, if its bigger than 180 = -360
                        maxlong = checkedFootPrintsArray[i].Easternmost_longitude - 360;
                        //  console.log("max lon: " + maxlong);
                    }
                    if (checkedFootPrintsArray[i].Westernmost_longitude > 180) {
                        minlong = checkedFootPrintsArray[i].Westernmost_longitude - 360;
                        //  console.log("min lon: " + minlong);
                    } else {
                        maxlong = checkedFootPrintsArray[i].Easternmost_longitude; //if long is in between -180/180 then assgin the original longs
                        minlong = checkedFootPrintsArray[i].Westernmost_longitude;
                    }

                    var rgbcombinationSurfaceImage = new WorldWind.SurfaceImage(new WorldWind.Sector(checkedFootPrintsArray[i].Minimum_latitude, checkedFootPrintsArray[i].Maximum_latitude, minlong, maxlong), WCPSLoadImage);

                    // clear the old loaded image first
                    renderLayer[i].removeAllRenderables();

                    // then load the RGBCombinations to this footprint shapesLayer
                    renderLayer[i].addRenderable(rgbcombinationSurfaceImage);


                    // Add footprint and query to download option in menu context
                    updateDownloadWCPSQuery(coverageID, WCPSLoadImage);


                    console.log("Load new RGB Combinations on selected footprint.");
                    break;
                }
            }
        }

        // load the RGB combinations result with subsetting
        // moon client
        window.loadRGBCombinationsMoon = function(selectedFootPrintObj, index, stretch) {

            var WCPS_TEMPLATE = 'for data in ( $COVERAGE_ID ) return encode( ' +
                                '{'
                                // insert bands here
                                + "$RGB_BANDS"
                                + '  alpha: ((data.band_85 > 0) * 255)[N( $minN$newN )] }, "png", "nodata=65535")';
            var redBand = selectedFootPrintObj.redBand;
            var greenBand = selectedFootPrintObj.greenBand;
            var blueBand = selectedFootPrintObj.blueBand;

            var maxlong;
            var minlong;
            // only load RGB Combinations to the selected footprint from selected comboBox
            maxlong = checkedFootPrintsArray[index].Easternmost_longitude; //assign maxlong from the checked footprint
            minlong = checkedFootPrintsArray[index].Westernmost_longitude; //assign minlong from the checked footprint
            if (checkedFootPrintsArray[index].Easternmost_longitude > 180) { //long in www spans from -180 to 180, if its bigger than 180 = -360
                maxlong = checkedFootPrintsArray[index].Easternmost_longitude - 360;
                //  console.log("max lon: " + maxlong);
            }
            if (checkedFootPrintsArray[index].Westernmost_longitude > 180) {
                minlong = checkedFootPrintsArray[index].Westernmost_longitude - 360;
                //  console.log("min lon: " + minlong);
            } else {
                maxlong = checkedFootPrintsArray[index].Easternmost_longitude; //if long is in between -180/180 then assgin the original longs
                minlong = checkedFootPrintsArray[index].Westernmost_longitude;
            }

            var coverageID = checkedFootPrintsArray[index].coverageID;

            // a template WCPS queries with subsettings
            var WCPSLoadImageTemplate = WCPS_TEMPLATE;
            WCPSLoadImageTemplate = WCPSLoadImageTemplate.replace("$COVERAGE_ID", coverageID);
            var redBand = "Red: " + "(" + selectedFootPrintObj.redBand + ")[N( $minN$newN )];";
            var greenBand = "Green: " + "(" + selectedFootPrintObj.greenBand + ")[N( $minN$newN )];";
            var blueBand = "Blue: " + "(" + selectedFootPrintObj.blueBand + ")[N( $minN$newN )];";

            var RGB_BANDS = redBand + " " + greenBand + " " + blueBand;
            WCPSLoadImageTemplate = WCPSLoadImageTemplate.replace("$RGB_BANDS", RGB_BANDS);

            if (stretch) {
                // use Python web service to stretch WCPS queries
                WCPSLoadImageTemplate = ps2StretchWCPSEndPoint + WCPSLoadImageTemplate;
            } else {
                WCPSLoadImageTemplate = ps2WCPSEndPoint + WCPSLoadImageTemplate;
            }

            // clear the title footprints temporary of the coverageID
            for (var i = 0; i < renderLayerTiles.length; i++) {
                var layer = renderLayerTiles[i];
                if (layer._displayName === checkedFootPrintsArray[index].coverageID) {
                    layer.removeAllRenderables();
                }
            }

            // Load the WCPS queries by subsettings
            loadSubsettingsWCPSQuery(WCPSLoadImageTemplate, index, minlong, maxlong);

            // no need to subset the WCPS query when download
            var WCPSLoadImage = replaceAll(WCPSLoadImageTemplate, "[N( $minN$newN )]", "");

            // Add footprint and query to download option in menu context
            updateDownloadWCPSQuery(coverageID, WCPSLoadImage);
        }

        // Create multiple WCPS queries by subsettings
        // moon client
        window.loadSubsettingsWCPSQuery = function(WCPSLoadImageTemplate, index, minlong, maxlong) {
            // this is N
            var minLatN = checkedFootPrintsArray[index].Minimum_latitude;
            var maxLatN = checkedFootPrintsArray[index].Maximum_latitude;
            var stepLat = (maxLatN - minLatN) / MOON_TILE_NUMBER;
            var newLatN = minLatN + stepLat;

            var r = 1737400;
            // this is Lat
            var rho = (Math.PI / 180);
            var minN = minLatN * r * rho;
            var maxN = maxLatN * r * rho;

            // var minN = checkedFootPrintsArray[i].Minimum_latitude;
            // var maxN = checkedFootPrintsArray[i].Maximum_latitude;
            var step = (maxN - minN) / MOON_TILE_NUMBER;
            var newN = minN + step;


            for (var l = 0; l < MOON_TILE_NUMBER; l++) {
                var minNnewN = minN + ":" + newN;

                var WCPSLoadImage = WCPSLoadImageTemplate;
                WCPSLoadImage = replaceAll(WCPSLoadImage, "$coverageID", checkedFootPrintsArray[index].coverageID);
                WCPSLoadImage = replaceAll(WCPSLoadImage, "$minN$newN", minNnewN);

                console.log(WCPSLoadImage);

                var surfaceImage = new WorldWind.SurfaceImage(new WorldWind.Sector(minLatN, newLatN, minlong, maxlong), WCPSLoadImage);
                console.log("Load default image on footprint: " + coverageID);

                var layer = new WorldWind.RenderableLayer("");
                // All of these temporary layers belonged to the coverageID
                layer._displayName = checkedFootPrintsArray[index].coverageID;
                layer.addRenderable(surfaceImage);

                renderLayerTiles.push(layer);

                // Add the loaded image in images layer
                imagesLayer.addRenderable(layer);
                minN = newN;
                newN = minN + step;

                minLatN = newLatN;
                newLatN = minLatN + stepLat;
            }
        }


        /* This function is used to draw chart when user click in 1 point and get all the values of bands */
        var queryBuilder = function(latitude, longitude, covID, east, west, centroid_longitude) {

            // Set the fileName when export to this value
            drawCoverageID = covID;
            drawLat = latitude;
            drawLon = longitude;

            var r = null;
            if (clientName === "mars") {
                r = 3396190;
            } else {
                r = 1737400;
            }

            // convert from degrees (latitude, longitude) to meters (E, N)
            var cosOf0 = 1;
            var rho = (Math.PI / 180);
            var N = latitude * r * rho;
            var E = longitude * cosOf0 * r * rho;

            if (latitude >= 65.0) { // coverages above 65° are stored in polar stereographic with the centerlongitude as the long0.

                var lat0 = 90;
                var lon0 = centroid_longitude;
                var k = 2 / (1 + Math.sin(lat0 * rho) * Math.sin(latitude * rho) + Math.cos(lat0 * rho) * Math.cos(latitude * rho) * Math.cos(longitude * rho - lon0 * rho));
                N = r * k * (Math.cos(lat0 * rho) * Math.sin(latitude * rho) - Math.sin(lat0 * rho) * Math.cos(latitude * rho) * Math.cos(longitude * rho - lon0 * rho));
                E = r * k * Math.cos(latitude * rho) * Math.sin(longitude * rho - lon0 * rho);


            }
            if (latitude <= -65.0) { // coverages below -65° are stored in polar stereographic with the centerlongitude as the long0.

                var lat0 = -90;
                var lon0 = centroid_longitude;
                var k = 2 / (1 + Math.sin(lat0 * rho) * Math.sin(latitude * rho) + Math.cos(lat0 * rho) * Math.cos(latitude * rho) * Math.cos(longitude * rho - lon0 * rho));
                N = r * k * (Math.cos(lat0 * rho) * Math.sin(latitude * rho) - Math.sin(lat0 * rho) * Math.cos(latitude * rho) * Math.cos(longitude * rho - lon0 * rho));
                E = r * k * Math.cos(latitude * rho) * Math.sin(longitude * rho - lon0 * rho);
            }

            // Get the selected Coverage ID RGB bands and query to get the values
            if (currentOpenDock === "mainChartDock") {

                //update the title of the chart with name and lat long
                $("#service-container .right-dock.plot-dock .panel-title").text("Coverage Name: " + covID);
                $("#service-container .right-dock.plot-dock .panel-title.panel-subtitle").text("Latitude: " + String(parseFloat(latitude).toFixed(5)) + ", Longitude: " + String(parseFloat(longitude).toFixed(5)));

                var rgbValues = '<hr style="margin-top: -30px;"> <div style="text-align: center; margin-top: -10px; color: white;" id="divRGBValues"> </div>';

                var result = ""; // query RGB values for the coordinate

                var isClickOnSelectedFootPrint = false;
                /*
                for(var i = 0; i < selectedFootPrintsArray.length; i++) {
                    // If find the footprint then get the R, G, B bands of it to query WCPS and get values
                    if(selectedFootPrintsArray[i].coverageID == covID) {
                        isClickOnSelectedFootPrint = true;

                        // Get all wcps queries for this footprint (it can have 3 bands or 1 or 2 bands)
                        var rgbArray = [];
                        if(selectedFootPrintsArray[i].redBand != "") {
                            rgbArray.push({"name" : "Red", "query" : selectedFootPrintsArray[i].redBand});
                        }

                        if(selectedFootPrintsArray[i].greenBand != "") {
                            rgbArray.push({"name" : "Green", "query" : selectedFootPrintsArray[i].greenBand});
                        }

                        if(selectedFootPrintsArray[i].blueBand != "") {
                            rgbArray.push({"name" : "Blue", "query" : selectedFootPrintsArray[i].blueBand});
                        }

                        // Get rgb values from rgb-combinator
                        window.queryRGBValue(covID, E, N, rgbArray);

                        break;
                    }
                }

                 // If clicked on unselected footprint then just load band defaults (WCPS queries for this footprint)
                if(!isClickOnSelectedFootPrint) {
                    var rgbArray = [{"name" : "Red", "query" : redBandDefault}, {"name" : "Green" , "query" : greenBandDefault}, {"name" : "Blue" , "query" : blueBandDefault}];

                    // Get rgb values from rgb-combinator
                    window.queryRGBValue(covID, E, N, rgbArray);
                }
                */

                //$("#mCSB_3_container").append(rgbValues);

                // open the chart dock #ui-id-3
                //$("#ui-id-3").addClass('open');
            } else if (currentOpenDock === "bandRatioDock") {
                // Remove the clicked marker here
                Landings_removePlaceMarker(placemarkLayer);

                // if band ratio dock is opened then store the latitude, longitude for the numerator or denominator
                if ($("#numeratorBandRatioDock").is(':checked')) {
                    // numerator
                    placeMarkersBandRatio[0].latitude = latitude;
                    placeMarkersBandRatio[0].longitude = longitude;

                    // remove the old marker first
                    Landings_removePlaceMarker(placeMarkersBandRatio[0].layer);

                    // add the new marker for this globe;
                    var layer = Landings_addPlaceMarker(5, placeMarkersBandRatio[0].name, placeMarkersBandRatio[0].iconPath, latitude, longitude);
                    placeMarkersBandRatio[0].layer = layer;
                    console.log(layer);
                } else {
                    // denominator
                    placeMarkersBandRatio[1].latitude = latitude;
                    placeMarkersBandRatio[1].longitude = longitude;

                    // remove the old marker first
                    Landings_removePlaceMarker(placeMarkersBandRatio[1].layer);

                    // add the new marker for this globe;
                    var layer = Landings_addPlaceMarker(6, placeMarkersBandRatio[1].name, placeMarkersBandRatio[1].iconPath, latitude, longitude);
                    placeMarkersBandRatio[1].layer = layer;
                    console.log(layer);
                }
            }

            // Mars use the lower case footprint, Moon is the upper case
            var query = "";
            if (clientName === "mars") {
                query = "http://access.planetserver.eu:8080/rasdaman/ows?query=for%20c%20in%20(" + covID.toLowerCase() + ")%20return%20encode(c[%20N(" +
                N + ":" + N + "),%20E(" + E + ":" + E + ")%20],%20%22csv%22)";
            } else {
                query = "http://access.planetserver.eu:8080/rasdaman/ows?query=for%20c%20in%20(" + covID + ")%20return%20encode(c[%20N(" +
                N + ":" + N + "),%20E(" + E + ":" + E + ")%20],%20%22csv%22)";
            }


            console.log("WCPS get bands value at clicked coordinate: " + query);
            Chart_getQueryResponseAndSetChart(query);

        };

        $(document).ready(function() {

            // load rgb bands to rgbDropDown from rgb_combination.js
            loadDropDownRGBBands();

            // load WCPS custom query to wcpsDropDown from rgb_combinations.js
            loadDropDownWCPSBands();
        });


        // Listen for Mouse clicks and regognize layers
        wwd.addEventListener("click", layerRecognizer);


        // right click function
        wwd.addEventListener("contextmenu", function(e) {
            e.preventDefault();
            // check if containedFootPrintsArray has at least 1 footprint
            rightClickMenuContext(e);
            if (containedFootPrintsArray.length > 0) {
                //https://api.jqueryui.com/menu/#option-position
                $("#menuContext").position({
                    my: "left top",
                    of: e
                });

                // Before menu item can be shown, it needs to init first with not close the submenu item
                // Just don't close the submenu of menucontext
                $("#menuContext").show();

            }
            return false;

        });

        ////////////////

        // Create a layer manager for controlling layer visibility.
        var layerManger = new LayerManager(wwd);

        // Now set up to handle highlighting.
        var highlightController = new WorldWind.HighlightController(wwd);

        // Create a coordinate controller to update the coordinate overlay elements.
        var coordinateController = new CoordinateController(wwd);

        var latitude = qsParam.lat;
        var longitude = qsParam.lon;
        var coverageID = qsParam.covID;
        var range = qsParam.range;

        // Set text boxes goto with values from URL
        $("#txtLatitudeGoTo").val(qsParam.lat);
        $("#txtLongitudeGoTo").val(qsParam.lon);
        $("#txtCoverageIDGoTo").val(qsParam.covID);


        // Generate a link to access to coverageID and/or Latitude and Longitude
        var link = ps2EndPoint + "index.html?";
        if (coverageID != "") {
            link = link + "covName=" + coverageID;
        }
        if (latitude != "" && longitude != "") {
            link = link + "&lat=" + latitude;
            link = link + "&lon=" + longitude;
        }

        // keep the current of range
        link = link + "&range=" + wwd.navigator.range;

        // add to goto panel
        $("#linkGoTo").attr("href", link);
        $("#linkGoTo").text(link);


        //go to CoverageID given in the URL
        if (coverageID !== "") {
            moveToCoverageID(coverageID);
        } else {
            // go to Latitude, Longitude in the URL
            moveToLocation(latitude, longitude, range);
        }

        // Move to coverageID on globe
        function moveToCoverageID(coverageID) {
            for (var i = 0; i < allFootPrintsArray.length; i++) {
                if (qsParam.covID.toLowerCase() === allFootPrintsArray[i].coverageID.toLowerCase()) {
                    var centerLatitude = (allFootPrintsArray[i].Maximum_latitude + allFootPrintsArray[i].Minimum_latitude) / 2;
                    var centerLongitude = (allFootPrintsArray[i].Easternmost_longitude + allFootPrintsArray[i].Westernmost_longitude) / 2;
                    moveToLocation(centerLatitude, centerLongitude, qsParam.range);
                    return;
                }
            }

            alert("Coverage Name: " + qsParam.covID + " does not exist.");
        }

        // Move to longitude, Latitude and Range
        function moveToLocation(latitude, longitude, range) {

            if (range != "") {
                if (range.toString().indexOf("e") > -1) {
                    wwd.navigator.range = range;
                } else {
                    //alert(range.toString().charAt(0) + "e" + (Math.round(range).toString().length - 1));
                    // wwd.navigator.range = (range.charAt(0) + "e" + (Math.round(range).toString().length - 1)).toString();
                    wwd.navigator.range = 4e6;
                }
            }

            console.log(wwd.navigator.range);

            wwd.goTo(new WorldWind.Location(latitude, longitude));


            // Add the default place marker
            placemark = new WorldWind.Placemark(new WorldWind.Position(latitude, longitude, range), true, null);
            var placemarkAttributes = new WorldWind.PlacemarkAttributes();
            placemarkAttributes.imageSource = CLICKED_ICON_PATH + "1.png";
            placemark.attributes = placemarkAttributes;


            // Put placemark, remove the last clicked point
            if (placemarkLayer != null) {
                //wwd.removeLayer(placemarkLayer);
                placemarkLayer.removeRenderable(placemark);
                placemarkLayer.addRenderable(placemark);

            } else {
                placemarkLayer = new WorldWind.RenderableLayer("Placemarks");
                placemarkLayer.addRenderable(placemark);
                wwd.insertLayer(4, placemarkLayer);
            }
        }


        // Handle when click on charts dock (e.g: main chart, band-ratio chart)
        var mainChartID = "#ui-id-3";
        var bandRatioChartID = "#ui-id-4";

        $(mainChartID).click(function() {
            // If the dock is closed then click to open
            if ($(mainChartID).hasClass("open")) {
                currentOpenDock = "mainChartDock";
                console.log("Hide the band ratio chart");

                if (placeMarkersBandRatio[0].layer != null) {
                    placeMarkersBandRatio[0].layer.enabled = false;
                }
                if (placeMarkersBandRatio[1].layer != null) {
                    placeMarkersBandRatio[1].layer.enabled = false;
                }
            } else {
                // close the dock then no dock is opened
                currentOpenDock = "";
            }

            //alert(currentOpenDock);
        });

        $(bandRatioChartID).click(function() {
            // If the dock is closed then click to open
            if ($(bandRatioChartID).hasClass("open")) {
                currentOpenDock = "bandRatioDock";

                console.log("Show the band ratio chart");
                if (placeMarkersBandRatio[0].layer != null) {
                    placeMarkersBandRatio[0].layer.enabled = true;
                }

                if (placeMarkersBandRatio[1].layer != null) {
                    placeMarkersBandRatio[1].layer.enabled = true;
                }

            } else {
                // close the dock
                // no dock is opened
                currentOpenDock = "";

                console.log("Hide the band ratio chart");
                if (placeMarkersBandRatio[0].layer != null) {
                    placeMarkersBandRatio[0].layer.enabled = false;
                }

                if (placeMarkersBandRatio[1].layer != null) {
                    placeMarkersBandRatio[1].layer.enabled = false;
                }
            }

            //alert(currentOpenDock);
        });




    });

// remove the place mark on the globe
function Landings_removePlaceMarker(layer) {
    // Put placemark, remove the last clicked point
    if (layer != null) {
        //wwd.removeLayer(layer);
    }
}

// add a place mark on the globe
function Landings_addPlaceMarker(layerIndex, placeMarkLayerName, iconPath, latitude, longitude) {
    var placemark = new WorldWind.Placemark(new WorldWind.Position(latitude, longitude, 1e2), true, null);
    var placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
    placemarkAttributes.imageSource = iconPath;
    placemark.attributes = placemarkAttributes;

    var layer = new WorldWind.RenderableLayer(placeMarkLayerName);
    layer.addRenderable(placemark);

    // Marker layer
    wwd.insertLayer(layerIndex, layer);

    return layer;
}

// add multiple place marks on a layer
function Landings_addMultiplePlaceMarkers(layerIndex, placeMarkersArray) {
    // create a new layer
    var layer = new WorldWind.RenderableLayer("mainChartsPlaceMarkersLayer");

    for (var i = 0; i < placeMarkersArray.length; i++) {
        var obj = placeMarkersArray[i];

        var placemark = new WorldWind.Placemark(new WorldWind.Position(obj.latitude, obj.longitude, 1e2), true, null);
        var placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
        placemarkAttributes.imageSource = obj.iconPath;
        placemark.attributes = placemarkAttributes;

        layer.addRenderable(placemark);
    }

    // Marker layer
    wwd.insertLayer(layerIndex, layer);

    return layer;
}

// when to show the placemark icon on the clicked point
function handlePlaceMarkerLayer() {
    if (placemarkLayer == null) {
        placemarkLayer = new WorldWind.RenderableLayer("Placemarks");
        placemarkLayer.addRenderable(placemark);

        // Marker layer
        wwd.insertLayer(4, placemarkLayer);
    } else {

        // Check which dock is opened
        if (currentOpenDock === "mainChartDock") {
            var chartIndex = placeMarkersArray.length;
            // Check if it is add chart or update chart
            if ($("#radioBtnAddChartMainChart").is(':checked')) {
                // Add chart, then create a place marker for the new line in main chart
                if (!isAddedALineChartMainChart) {
                    // if any line chart is not drawn, then just remove the previous one, no add the place marker
                    placemarkLayer.removeRenderable(placemark);

                    addPlaceMarker(CLICKED_ICON_PATH + "1.png");
                } else {
                    // a line chart is drawn, then can add the place marker
                    if (chartIndex < MAXIMUM_LINECHARTS) {
                        var iconPath = CLICKED_ICON_PATH + (chartIndex + 1) + ".png";
                        addPlaceMarker(iconPath);
                    }
                }
            } else {
                // Update chart, then remove the previous clicked place marker and add the new place marker
                placemarkLayer.removeRenderable(placemark);

                // 0 is for spectral library
                if (chartIndex == 0) {
                    chartIndex = 1;
                }
                var iconPath = CLICKED_ICON_PATH + (chartIndex) + ".png";
                addPlaceMarker(iconPath);
            }
        } else {
            // just clear the previous clicked point
            placemarkLayer.removeRenderable(placemark);

            // Add the new place mark on the clicked point
            addPlaceMarker(CLICKED_ICON_PATH + "1.png");
        }
        /*
        // Only remove the previous point if it is not the add line charts in main charts
        if(!$("#radioBtnAddChartMainChart").is(':checked')) {
            // only when the main dock is not opened then remove all the place markers
            // and remove the update chart only, not all the clicked points
            placemarkLayer.removeAllRenderables();
        }

        // Only add new place marker if it is allowed
        if(placeMarkersArray.length < MAXIMUM_LINECHARTS) {
            placemarkLayer.addRenderable(placemark);
        } */
    }

    wwd.redraw();
}

function replaceAll(template, target, replacement) {
    return template.split(target).join(replacement);
};

// Add the place marker at clicked position
function addPlaceMarker(iconPath) {
    placemark = new WorldWind.Placemark(new WorldWind.Position(clickedLatitude, clickedLongitude, 1e2), true, null);
    var placemarkAttributes = new WorldWind.PlacemarkAttributes();
    placemarkAttributes.imageSource = iconPath;
    placemark.attributes = placemarkAttributes;

    placemarkLayer.addRenderable(placemark);
}
