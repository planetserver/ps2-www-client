/*
* Copyright (C) 2014 United States Government as represented by the Administrator of the
* National Aeronautics and Space Administration. All Rights Reserved.
*/
/**
* @version $Id: BasicExample.js 3320 2015-07-15 20:53:05Z dcollins $
*/

/* Global variables */

checkedFootPrintsArray = []; // array of footprints that user choosed
lastCovID = ""; // last footprint which contains clicked point (it does not need to be the last index of checkedFootPrintArray)

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

var qsParam = {
    lat: getQueryVariable("lat"),
    lon: getQueryVariable("lon"),
    range: getQueryVariable("range"),
    coverage: getQueryVariable("coverage")
};

requirejs(['./config/config',
        '../src/WorldWind',
        './CoordinateController',
        './LayerManager',
        '../src/navigate/Navigator',
        './footprints'
    ],
    function(config,
        ww,
        CoordinateController,
        LayerManager,
        Navigator,
        Footprints) {
        "use strict";

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        var wwd = new WorldWind.WorldWindow("canvasOne");


        var layers = [{
            layer: new WorldWind.BMNGLayer("moon_wgs84"),
            enabled: false
        }, {
            layer: new WorldWind.BMNGLayer("mars_wgs84"),
            enabled: true
        }];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }
        wwd.redraw();

        // Create a layer to hold the surface shapes.
        var shapesLayer = new WorldWind.RenderableLayer("");
        wwd.addLayer(shapesLayer);

        // Create and set attributes for it. The shapes below except the surface polyline use this same attributes
        // object. Real apps typically create new attributes objects for each shape unless they know the attributes
        // can be shared among shapes.
        var attributes = new WorldWind.ShapeAttributes(null);
        attributes.outlineColor = WorldWind.Color.RED;
        //attributes.interiorColor = new WorldWind.Color(0, 255, 25, 0.00001);
        attributes.drawInterior = false;

        var checkedAttributes = new WorldWind.ShapeAttributes(null);
        checkedAttributes.outlineColor = WorldWind.Color.BLUE;
        checkedAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
        checkedAttributes.drawInterior = false;

        //Adding allFootPrintsArray
        var boundaries = []; // array for boundary locations of the footprints
        var shapes = []; // array for shape SurfacePolygon objects with corresponding boundaries and attributes
        for (var i = 0; i < allFootPrintsArray.length; i++) {
            boundaries.push([]); // new array for the boundaries of a single footprint
            shapes.push([]);
            for (var j = 0; j < allFootPrintsArray[i].latList.length; j++) {
                // adding all the boundaries of a single polygon into boundaries[i]
                boundaries[i].push(new WorldWind.Location(allFootPrintsArray[i].latList[j], allFootPrintsArray[i].longList[j]));
            }

            shapes[i] = new WorldWind.SurfacePolygon(boundaries[i], attributes);
            shapes[i]._displayName = allFootPrintsArray[i].coverageID; // setting the exact name of the polygon into _displayName


            shapes[i].highlightAttributes = checkedAttributes;

            shapesLayer.addRenderable(shapes[i]);
        }


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

            // Get the clicked point (if it clicks on the globe then use object[0] or click on loaded image then use object[1])
            var clickedLatitude  = pickList.objects[0].position != null ? pickList.objects[0].position.latitude  : pickList.objects[1].position.latitude;
            var clickedLongitude = pickList.objects[0].position != null ? pickList.objects[0].position.longitude : pickList.objects[1].position.longitude;

            // get last footprint which contains the new clicked point (load image by synchronous)
            $.when(getFootPrintsContainingPoint(shapes, attributes, checkedAttributes, clickedLatitude, clickedLongitude)).then(function() {
                console.log("Found containing footprints now check to draw chart.");
                // if click on loaded image then draw chart
                if(pickList.objects[1] != null) {
                    console.log("Draw chart on coverageID: " + lastCovID);
                    // then it will load the array of values for all the bands which contains the clicked point and draw the chart
                    queryBuilder(clickedLatitude, clickedLongitude, lastCovID);
                }

            });
        };

        // This function is called in Footprints.js of getFootPrintsContainingPoint() to get access to the checkedFootPrintsArray.
        var surfaceImage = []; // array for images

        //var renderLayer = new WorldWind.RenderableLayer();
        var renderLayer = [];

        /* This function is called from landing.js after all checked footprints are updated to checkedFootPrintsArray
        and it loads the image accordingly to checked footprints
        */
        window.accessCheckedFootPrintsArray = function() {

            for (i = 0; i < checkedFootPrintsArray.length; i++) {
                var coverageID = checkedFootPrintsArray[i].coverageID.toLowerCase();
                var maxlong;
                var minlong;
                //  console.log("Checked Footprint: " + i + " ");
                //  console.log("east lat1: " + checkedFootPrintsArray[i].Easternmost_longitude);
                // console.log("west lat1: " + checkedFootPrintsArray[i].Westernmost_longitude);
                maxlong = checkedFootPrintsArray[i].Easternmost_longitude; //assign maxlong from the checked footprint
                minlong = checkedFootPrintsArray[i].Westernmost_longitude; //assign minlong from the checked footprint
                if(checkedFootPrintsArray[i].Easternmost_longitude > 180){ //long in www spans from -180 to 180, if its bigger than 180 = -360
                   maxlong = checkedFootPrintsArray[i].Easternmost_longitude - 360;
                  //  console.log("max lon: " + maxlong);
                 }if (checkedFootPrintsArray[i].Westernmost_longitude > 180){
                   minlong = checkedFootPrintsArray[i].Westernmost_longitude - 360;
                  //  console.log("min lon: " + minlong);
                 } else{
                  maxlong = checkedFootPrintsArray[i].Easternmost_longitude; //if long is in between -180/180 then assgin the original longs
                  minlong = checkedFootPrintsArray[i].Westernmost_longitude;
                }
                var WCPSLoadImage = "http://access.planetserver.eu:8080/rasdaman/ows?query=for%20data%20in%20(%20" + coverageID + "%20)%20return%20encode(%20{%20red:%20(int)(255%20/%20(max((data.band_233%20!=%2065535)%20*%20data.band_233)%20-%20min(data.band_233)))%20*%20(data.band_233%20-%20min(data.band_233));%20green:%20(int)(255%20/%20(max((data.band_78%20!=%2065535)%20*%20data.band_78)%20-%20min(data.band_78)))%20*%20(data.band_78%20-%20min(data.band_78));%20blue:(int)(255%20/%20(max((data.band_13%20!=%2065535)%20*%20data.band_13)%20-%20min(data.band_13)))%20*%20(data.band_13%20-%20min(data.band_13));%20alpha:%20(data.band_100%20!=%2065535)%20*%20255%20},%20%22png%22,%20%22nodata=null%22)";
                surfaceImage[i] = new WorldWind.SurfaceImage(new WorldWind.Sector(checkedFootPrintsArray[i].Minimum_latitude, checkedFootPrintsArray[i].Maximum_latitude, minlong, maxlong), WCPSLoadImage);
                //  console.log("pute: " + surfaceImage[i]);
                //  console.log("WCPS query: "  + WCPSLoadImage);
                //  console.log("max lat: " + checkedFootPrintsArray[i].Maximum_latitude);
                //  console.log("min lat: " + checkedFootPrintsArray[i].Minimum_latitude);
                //  console.log("east lat: " + checkedFootPrintsArray[i].Easternmost_longitude);
                //  console.log("west lat: " + checkedFootPrintsArray[i].Westernmost_longitude);



                renderLayer[i] = new WorldWind.RenderableLayer();
                renderLayer[i].addRenderable(surfaceImage[i]);
                wwd.addLayer(renderLayer[i]);
                shapesLayer.addRenderable(renderLayer[i]);

            }
        }


        /* This function will go to the footprint coordinates from checked footprints table */
        window.viewCheckedFootPrintRow = function(viewObj) {
            // view to clicked position of this checked coverage
            var lat_long = viewObj.getAttribute("data-content");
            var lat = lat_long.split("_")[0];
            var long = lat_long.split("_")[1];
            // move to the position
            //wwd.navigator.range = 5e6; (zoom 5*10^6 meters)
            wwd.goTo(new WorldWind.Position(lat, long, qsParam.range));
        }


        /* This function is used to draw chart when user click in 1 point and get all the values of bands */
        var queryBuilder = function(latitude, longitude, covID) {
            var PI = 3.141516;
            var r = 3396200;
            var cosOf0 = 1;
            var N = latitude * r * (PI / 180);
            var E = longitude * cosOf0 * r * (PI / 180);
            console.log("cov name: " + covID);
            console.log("N: " + N);
            console.log("E: " + E);

            var query = "http://access.planetserver.eu:8080/rasdaman/ows?query=for%20c%20in%20(" + covID.toLowerCase() + ")%20return%20encode(c[%20N(" +
                N + ":" + N + "),%20E(" + E + ":" + E + ")%20],%20%22csv%22)";

            console.log("Query for the click: " + query);
            getQueryResponseAndSetChart(query);

        };

        function getQueryResponseAndSetChart(query) {
            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", query, true);
            rawFile.onreadystatechange = function() {
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        serverResponse = rawFile.responseText;
                        var parsedFloats = [];
                        parsedFloats = parseFloats(serverResponse);

                        loadScriptAndCall("http://d3js.org/d3.v3.min.js", implementChart(parsedFloats));
                    }
                }
            }

            rawFile.send(null);
        }


        //Implementation function of the graph
        var implementChart = function(floatsArray) {
            //************************************************************
            // Data notice the structure
            //************************************************************
            d3.select("svg").remove();
            var data = [];
            var i = 0,
                j = 0;
            var xDist = (4.0 - 1.0) / floatsArray.length; // Value for setting the equidistance Band wavelength which should be between 1 and 4
            var xPrev = 1.0; // Value used for storing the Band wavelength of the previous Band
            var Ymin = Infinity,
                Ymax = -Infinity; // Values for getting the minimum and maximum out of the array
            /*Adjusting the data so that every single point is with point has a format {'x':__,'y':__}*/
            /*splitting the datasets when 65535 is occured so that points with values 65535 are not ploted*/
            while (i < floatsArray.length) {
                if (floatsArray[i] != 65535) {
                    data.push([]);
                    while (floatsArray[i] != 65535) {
                        data[j].push({
                            'x': xPrev,
                            'y': floatsArray[i]
                        });
                        if (Ymin > floatsArray[i]) { // Getting the minimum
                            Ymin = floatsArray[i];
                        } else if (Ymax < floatsArray[i]) { // Getting up the minimum
                            Ymax = floatsArray[i];
                        }
                        xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
                        i++;
                    }
                    j++;
                }
                xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
                i++;
            }

            /*Different collors for plotting the distinct datasets formed in the above while loop*/
            var colors = ['white']

            //************************************************************
            // Create Margins and Axis and hook our zoom function
            //************************************************************
            var margin = {
                    top: 20,
                    right: 30,
                    bottom: 30,
                    left: 50
                },
                width = 620 - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            var innerwidth = width - margin.left - margin.right,
                innerheight = height - margin.top - margin.bottom;

            var x = d3.scale.linear()
                .domain([1.0, 4.0])
                .range([0, width]);

            var y = d3.scale.linear()
                .domain([Ymin, Ymax])
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .tickSize(-height)
                .tickPadding(10)
                .tickSubdivide(true)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .tickPadding(10)
                .tickSize(-width)
                .tickSubdivide(true)
                .orient("left");

            var zoom = d3.behavior.zoom()
                .x(x)
                .y(y)
                .scaleExtent([0.5, (floatsArray.length / 4)]) // 1st value is for zooming out; 2nd is for zooming in
                .on("zoom", zoomed);

            //************************************************************
            // Generate our SVG object
            //************************************************************
            var svg = d3.select(".right-dock.open").append("svg")
                .call(zoom)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            svg.append("g")
                .attr("class", "y axis")
                .append("text")
                .attr("class", "axis-label")
                .attr("transform", "rotate(-90)")
                .attr("y", (-margin.left) + 10)
                .attr("x", -height / 2)
                .text('Reflectance');

            svg.append("g")
                .attr("class", "x axis")
                .append("text")
                .attr("class", "axis-label")
                // .attr("transform", "rotate(-90)")
                .attr("y", (-margin.bottom) - 10)
                .attr("x", -height / 2)
                .text('Wavelength');

            svg.append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            //************************************************************
            // Create D3 line object and draw data on our SVG object
            //************************************************************
            var line = d3.svg.line()
                .interpolate("linear")
                .x(function(d) {
                    return x(d.x);
                })
                .y(function(d) {
                    return y(d.y);
                });

            svg.selectAll('.line')
                .data(data)
                .enter()
                .append("path")
                .attr("class", "line")
                .attr("clip-path", "url(#clip)")
                .attr('stroke', function(d, i) {
                    return colors[i % colors.length];
                })
                .attr("d", line);

            //************************************************************
            // Draw points on SVG object based on the data given
            //************************************************************
            var points = svg.selectAll('.dots')
                .data(data)
                .enter()
                .append("g")
                .attr("class", "dots")
                .attr("clip-path", "url(#clip)");

            points.selectAll('.dot')
                .data(function(d, index) {
                    var a = [];
                    d.forEach(function(point, i) {
                        a.push({
                            'index': index,
                            'point': point
                        });
                    });
                })
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr("r", 2.5)
                .attr('fill', function(d, i) {
                    return colors[d.index % colors.length];
                })
                .attr("transform", function(d) {
                    return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")";
                });

            //************************************************************
            // Zoom specific updates
            //************************************************************
            function zoomed() {
                svg.select(".x.axis").call(xAxis);
                svg.select(".y.axis").call(yAxis);
                svg.selectAll('path.line').attr('d', line);

                points.selectAll('circle').attr("transform", function(d) {
                    return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")";
                });
            }
        }

        // function for loading the graph library //d3js.org/d3.v3.min.js located in the index.html
        var serverResponse = " ";

        function loadScriptAndCall(url, callback) {
            // Adding the script tag to the head as suggested before
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;

            // Then bind the event to the callback function.
            // There are several events for cross browser compatibility.
            script.onreadystatechange = callback;
            script.onload = callback;

            // Fire the loading
            head.appendChild(script);
        }


        function parseFloats(input) {
            var floatsArray = [];
            var helpString = input;

            var parsedFloat = parseFloat(helpString.slice(2, helpString.indexOf(" ")));

            while (helpString.indexOf(" ") != -1) {
                floatsArray.push(parsedFloat);
                helpString = helpString.slice(helpString.indexOf(" ") + 1, helpString.length);
                var parsedFloat = parseFloat(helpString.slice(0, helpString.indexOf(" ")));
            }

            return floatsArray;
        }

        // Listen for Mouse clicks and regognize layers
        wwd.addEventListener("click", layerRecognizer);

        ////////////////

        // Create a layer manager for controlling layer visibility.
        var layerManger = new LayerManager(wwd);

        // Now set up to handle highlighting.
        var highlightController = new WorldWind.HighlightController(wwd);

        // Create a coordinate controller to update the coordinate overlay elements.
        var coordinateController = new CoordinateController(wwd);

        //go to Location given in the URL
        var myLocation = new WorldWind.Position(qsParam.lat, qsParam.lon, qsParam.range);
        wwd.goTo(myLocation);


    });
