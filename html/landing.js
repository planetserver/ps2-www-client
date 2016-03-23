/*
* Copyright (C) 2014 United States Government as represented by the Administrator of the
* National Aeronautics and Space Administration. All Rights Reserved.
*/
/**
* @version $Id: BasicExample.js 3320 2015-07-15 20:53:05Z dcollins $
*/

checkedFootPrintsArray = []; // array of footprints that user choosed

function getQueryVariable(variable){
   var query = window.location.search.substring(1);
   var vars  = query.split("&");
   for (var i=0; i<vars.length; i++) {
       var pair = vars[i].split("=");
       if(pair[0] == variable){return pair[1];}}
   return(false);}

var qsParam = {lat:          getQueryVariable("lat"),
                  lon:          getQueryVariable("lon"),
                  range:        getQueryVariable("range"),
                  coverage:     getQueryVariable("coverage") };
//alert(qsParam.lat);

requirejs(['./config/config',
	   '../src/WorldWind',
           './CoordinateController',
           './LayerManager',
           '../src/navigate/Navigator',
           './Footprints'],
function (config,
          ww,
          CoordinateController,
          LayerManager,
          Navigator,
          Footprints) {
    "use strict";

    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

    var wwd = new WorldWind.WorldWindow("canvasOne");


    var layers = [
      {layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: false},
      {layer: new WorldWind.BMNGLayer("mars_wgs84"), enabled: true}
    ];

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
      //surface image test begin
    // var surfaceImage2 = new WorldWind.SurfaceImage(new WorldWind.Sector(-47.57565, -47.36640, 4.220789, 4.535433),
    // "http://212.201.45.9:8080/rasdaman/ows?query=for%20data%20in%20(%20frt00003590_07_if164l_trr3%20)%20return%20encode(%20{%20red:%20(int)(255%20/%20(max((data.band_233%20!=%2065535)%20*%20data.band_233)%20-%20min(data.band_233)))%20*%20(data.band_233%20-%20min(data.band_233));%20green:%20(int)(255%20/%20(max((data.band_78%20!=%2065535)%20*%20data.band_78)%20-%20min(data.band_78)))%20*%20(data.band_78%20-%20min(data.band_78));%20blue:(int)(255%20/%20(max((data.band_13%20!=%2065535)%20*%20data.band_13)%20-%20min(data.band_13)))%20*%20(data.band_13%20-%20min(data.band_13));%20alpha:%20(data.band_100%20!=%2065535)%20*%20255%20},%20%22png%22,%20%22nodata=null%22)");

    var checkedAttributes = new WorldWind.ShapeAttributes(null);
    checkedAttributes.outlineColor = WorldWind.Color.BLUE;
    checkedAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
    checkedAttributes.drawInterior = false;

    //Adding allFootPrintsArray
    var boundaries = []; // array for boundary locations of the footprints
    var shapes = []; // array for shape SurfacePolygon objects with corresponding boundaries and attributes
    for(var i = 0; i < allFootPrintsArray.length; i++) {
        boundaries.push([]); // new array for the boundaries of a single footprint
        shapes.push([]);
        for(var j = 0; j < allFootPrintsArray[i].latList.length; j++) {
            // adding all the boundaries of a single polygon into boundaries[i]
            boundaries[i].push(new WorldWind.Location(allFootPrintsArray[i].latList[j], allFootPrintsArray[i].longList[j]));
        }

        shapes[i] = new WorldWind.SurfacePolygon(boundaries[i], attributes);
        shapes[i]._displayName = allFootPrintsArray[i].coverageID; // setting the exact name of the polygon into _displayName


        shapes[i].highlightAttributes = checkedAttributes;

        shapesLayer.addRenderable(shapes[i]);
     }

    // Add the surface images to a layer and the layer to the World Window's layer list.
    // var surfaceImageLayer = new WorldWind.RenderableLayer();
    // surfaceImageLayer.displayName = "Surface Images";
    // surfaceImageLayer.addRenderable(surfaceImage2);
    // wwd.addLayer(surfaceImageLayer);
    // shapesLayer.addRenderable(surfaceImageLayer);
    //surface image test end

//////////////////

       window.layerRecognizer = function (o) {
	      // X and Y coordinates of a single click
	      var x = o.clientX,
	      y = o.clientY;
	      //console.log("The coordinates are: " + x + " " + y);
	      var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

        // NOTE: if click onto checked footprint (color fill polygon with another attribute), this function below does not work
	      if (pickList.objects.length < 2){
          var clickedLatitude = pickList.objects[0].position.latitude;
  	      var clickedLongitude = pickList.objects[0].position.longitude;
        }else{
          var clickedLatitude = pickList.objects[1].position.latitude;
  	      var clickedLongitude = pickList.objects[1].position.longitude;
          var coverageName = accessCheckedFootPrintsArray();
          queryBuilder(clickedLatitude, clickedLongitude, coverageName);
        }
	      //alert(clickedLatitude + " " + clickedLongitude);

	      console.log(pickList);
	      console.log("The latitude value clicked is: " + clickedLatitude);
	      console.log("The longtitude value clicked is: " + clickedLongitude);

        // queryBuilder(clickedLatitude, clickedLongitude);

	      console.log(pickList);

	      // get all the coverages containing clicked point
	      getFootPrintsContainingPoint(shapes, attributes, checkedAttributes, clickedLatitude, clickedLongitude);
    };

   // This function is called in Footprints.js of getFootPrintsContainingPoint() to get access to the checkedFootPrintsArray.
   var surfaceImage = []; // array for images
   //var renderLayer = new WorldWind.RenderableLayer();
   var renderLayer = [];
   window.accessCheckedFootPrintsArray = function() {
	  for(i = 0; i < checkedFootPrintsArray.length; i++) {
	       var coverageID = checkedFootPrintsArray[i].coverageID.toLowerCase();
	       console.log("Checked Footprint: " + i + " ");
	       var WCPSLoadImage = "http://212.201.45.9:8080/rasdaman/ows?query=for%20data%20in%20(%20" + coverageID +"%20)%20return%20encode(%20{%20red:%20(int)(255%20/%20(max((data.band_233%20!=%2065535)%20*%20data.band_233)%20-%20min(data.band_233)))%20*%20(data.band_233%20-%20min(data.band_233));%20green:%20(int)(255%20/%20(max((data.band_78%20!=%2065535)%20*%20data.band_78)%20-%20min(data.band_78)))%20*%20(data.band_78%20-%20min(data.band_78));%20blue:(int)(255%20/%20(max((data.band_13%20!=%2065535)%20*%20data.band_13)%20-%20min(data.band_13)))%20*%20(data.band_13%20-%20min(data.band_13));%20alpha:%20(data.band_100%20!=%2065535)%20*%20255%20},%20%22png%22,%20%22nodata=null%22)";

		  // surfaceImage.push([]);
		  surfaceImage[i] = new WorldWind.SurfaceImage( new WorldWind.Sector(checkedFootPrintsArray[i].Minimum_latitude, checkedFootPrintsArray[i].Maximum_latitude, checkedFootPrintsArray[i].Westernmost_longitude, checkedFootPrintsArray[i].Easternmost_longitude), WCPSLoadImage);
		   console.log("pute: " + surfaceImage[i]);
       console.log("WCPS query: "  + WCPSLoadImage);
		   console.log("max lat: " + checkedFootPrintsArray[i].Maximum_latitude);
		   console.log("min lat: " + checkedFootPrintsArray[i].Minimum_latitude);
		   console.log("west lon: " + checkedFootPrintsArray[i].Westernmost_longitude);
		   console.log("east lon: " + checkedFootPrintsArray[i].Easternmost_longitude);
       renderLayer[i] = new WorldWind.RenderableLayer();
       renderLayer[i].addRenderable(surfaceImage[i]);
       wwd.addLayer(renderLayer[i]);
       shapesLayer.addRenderable(renderLayer[i]);
         }


   }


   window.viewCheckedFootPrintRow = function (viewObj) {
	// view to clicked position of this checked coverage
        var lat_long = viewObj.getAttribute("data-content");
	var lat = lat_long.split("_")[0];
	var long = lat_long.split("_")[1];
	// move to the position
	//wwd.navigator.range = 5e6; (zoom 5*10^6 meters)
        wwd.goTo(new WorldWind.Position(lat, long, qsParam.range));
   }

    var queryBuilder = function (latitude, longitude, covID) {
        var PI = 3.141516;
                var r = 3396200;
                var cosOf0 = 1;
                var N = latitude * r * (PI/180);
                var E = longitude * cosOf0 * r * (PI/180);
              console.log("cov name: " +covID);
        console.log("N: " +N);
        console.log("E: " +E);
                var query = "http://212.201.45.9:8080/rasdaman/ows?query=for%20c%20in%20(frt00003590_07_if164l_trr3)%20return%20encode(c[%20N("
                                + N +":" + N + "),%20E(" + E + ":" + E + ")%20],%20%22csv%22)";

                console.log("Query for the click: " + query);
getQueryResponseAndSetChart(query);

            };

// adjusting the data we have for plotting with D3 library
function adjustData(parsedFloats){

  var Xaxis = [];
  for(var i = 0; i < parsedFloats.length; i++){
    Xaxis.push(i);
  }
  var XandYaxis = [];
  XandYaxis.push(Xaxis);
  XandYaxis.push(parsedFloats);
  return XandYaxis;
}

            function getQueryResponseAndSetChart(query) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", query, true);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                serverResponse = rawFile.responseText;
                var parsedFloats = [];
                parsedFloats = parseFloats(serverResponse);

                loadScriptAndCall("//d3js.org/d3.v3.min.js", implementChart(adjustData(parsedFloats)));
            }
        }
    }

    rawFile.send(null);
}


//Implementation function of the graph
  var implementChart = function(valuesArray) {
d3.select("svg").remove();
var data = [ { x: valuesArray[0],
               y: valuesArray[1] } ] ;
var xy_chart = d3_xy_chart()
    .width(660)
    .height(350)
    .xlabel("X Axis")
    .ylabel("Y Axis") ;
var svg = d3.select(".right-dock.open").append("svg")
    .datum(data)
    .call(xy_chart) ;

function d3_xy_chart() {
    var width = 440,
        height = 280,
        xlabel = "X Axis Label",
        ylabel = "Y Axis Label" ;

    function chart(selection) {
        selection.each(function(datasets) {
            //
            // Create the plot.
            //
            var margin = {top: 20, right: 10, bottom: 30, left: 40},
                innerwidth = width- margin.left - margin.right,
                innerheight = height - margin.top - margin.bottom ;

            var x_scale = d3.scale.linear()
                .range([0, innerwidth])
                .domain([ d3.min(datasets, function(d) { return d3.min(d.x); }),
                          d3.max(datasets, function(d) { return d3.max(d.x); }) ]) ;

            var y_scale = d3.scale.linear()
                .range([innerheight, 0])
                .domain([ d3.min(datasets, function(d) { return d3.min(d.y); }),
                          d3.max(datasets, function(d) { return d3.max(d.y); }) ]) ;

            var color_scale = d3.scale.category10()
                .domain(d3.range(datasets.length)) ;

            var x_axis = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom") ;

            var y_axis = d3.svg.axis()
                .scale(y_scale)
                .orient("left") ;

            var x_grid = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom")
                .tickSize(-innerheight)
                .tickFormat("") ;

            var y_grid = d3.svg.axis()
                .scale(y_scale)
                .orient("left")
                .tickSize(-innerwidth)
                .tickFormat("") ;

            var draw_line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x_scale(d[0]); })
                .y(function(d) { return y_scale(d[1]); }) ;

            // var zoom = d3.behavior.zoom()
            //     .x(x_scale)
            //     .y(y_scale)
            //     .scaleExtent([1, 10])
            //     .on("zoom", zoomed);
            //     function zoomed() {
            //         svg.select(".x_scale.axis").call(x_axis);
            //         svg.select(".y_scale.axis").call(y_axis);
            //       }

            var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;

            svg.append("g")
                .attr("class", "x grid")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(x_grid) ;

            svg.append("g")
                .attr("class", "y grid")
                .call(y_grid) ;

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(x_axis)
                .append("text")
                .attr("dy", "-.71em")
                .attr("x", innerwidth)
                .style("text-anchor", "end")
                .text(xlabel) ;

            svg.append("g")
                .attr("class", "y axis")
                .call(y_axis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .style("text-anchor", "end")
                .text(ylabel) ;

            var data_lines = svg.selectAll(".d3_xy_chart_line")
                .data(datasets.map(function(d) {return d3.zip(d.x, d.y);}))
                .enter().append("g")
                .attr("class", "d3_xy_chart_line") ;

            data_lines.append("path")
                .attr("class", "line")
                .attr("d", function(d) {return draw_line(d); })
                .attr("stroke", function(_, i) {return color_scale(i);}) ;

            data_lines.append("text")
                .datum(function(d, i) { return {name: datasets[i].label, final: d[d.length-1]}; })
                .attr("transform", function(d) {
                    return ( "translate(" + x_scale(d.final[0]) + "," +
                             y_scale(d.final[1]) + ")" ) ; })
                .attr("x", 3)
                .attr("dy", ".35em")
                .attr("fill", function(_, i) { return color_scale(i); })
                .text(function(d) { return d.name; }) ;


        }) ;

    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.xlabel = function(value) {
        if(!arguments.length) return xlabel ;
        xlabel = value ;
        return chart ;
    } ;

    chart.ylabel = function(value) {
        if(!arguments.length) return ylabel ;
        ylabel = value ;
        return chart ;
    } ;

    return chart;
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

    while(helpString.indexOf(" ") != -1) {
        if(parsedFloat != 65535){
            floatsArray.push(parsedFloat);
        }
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
    var myLocation = new WorldWind.Position(qsParam.lat, qsParam.lon,qsParam.range);
    wwd.goTo(myLocation);


  });
