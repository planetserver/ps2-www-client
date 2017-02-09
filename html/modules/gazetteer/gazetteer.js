// check if landing sites are shown
var isShowGazetteer = false;

// map layer
var gazetteerLayer = null;

// object
//var shapeFile = null;

// All regions are possible
availableRegionsCSV = [];
availableRegions = [];

// change to ps2EndPoint later
//var localEndPoint = "http://localhost:8080/";
var localEndPoint = ps2EndPoint;

var MIN_DIAMETER = 0;
var MAX_DIAMTER = 2500;

// no load diameter lesser
var MIN_DEFAULT_LOAD = 100;

// layer
gazetteerLayer = null;


var minSlider = 0;
var maxSlider = 0;

$(document).ready(function() {

    if (clientName == MARS_CLIENT) {
        dataFile = localEndPoint + "/html/data/shapefiles/mars/MARS_nomenclature.csv";
    } else {
        dataFile = localEndPoint + "/html/data/shapefiles/moon/MOON_nomenclature.csv";
    }

    $.ajax({
        type: "GET",
        url: dataFile,                       
        success: function(data) {
            availableRegionsCSV = parseCsvToArray(data);
        }
    });

    // slider for diameter view
    $( "#sliderDiameter" ).slider({
        range: true,
        min: 0,
        max: 2500,
        values: [ 500, 2500 ],
        slide: function( event, ui ) {
            if (isShowGazetteer === false) {                
                return false;
            } else {
                $( "#sizeDiameter" ).html(ui.values[ 0 ] + " km - " + ui.values[ 1 ] + " km"); 
                minSlider = ui.values[ 0 ];
                maxSlider = ui.values[ 1 ];

                // reload the gazeteer layer by the size range
                reloadDimaterRange();
            }            
        }       
    });

    // set the startsize range
    $( "#sizeDiameter" ).html($("#sliderDiameter").slider("values", 0) + " km - " + $("#sliderDiameter").slider("values", 1) + " km");


    $('#radioGazetteerShow').click(function() {
        if (isShowGazetteer === false) {
            $( "#sliderDiameter" ).show();
            isShowGazetteer = true;           
            // load the records from shapefile
            addPlaceMarks();
        } else {
            alert("Please chose hide this layer.");
        }        
    });

    $('#radioGazetteerHide').click(function() {
        if (isShowGazetteer === true) {
            isShowGazetteer = false;           
            // hide the layer
            addPlaceMarks();

            $( "#sliderDiameter" ).hide();
        } else {
            alert("Please chose show this layer.");
        }
    });



    // when range diamater is changed, then need to reload the gazetteer layer
    function reloadDimaterRange() {
        var min = parseFloat(minSlider);
        var max = parseFloat(maxSlider);        

        if (min < MIN_DIAMETER) {
            alert("Min diameter must be greater than 0!");
            return false;
        } else if (max > MAX_DIAMTER) {
            alert("Max diameter must be lesser than " + MAX_DIAMTER);
            return false;
        } else if (min > max) {
            alert("Min: " + min + " cannot greater than max: " + max + " diameter!");
            return false;
        }                

        // filter the place markers by the diameter range
        var placeMarkArray = gazetteerLayer.renderables;
        for (var i = 0; i < placeMarkArray.length; i++) {
            var diameter = parseFloat(placeMarkArray[i].userProperties.diameter);
            if (diameter >= min && diameter <= max) {
                placeMarkArray[i].enabled = true;
            } else {
                placeMarkArray[i].enabled = false;
            }
        }

        gazetteerLayer.enabled = true;

        return true;
    }

    // make array of place markers and add it on Gazetteer layer
    function addPlaceMarks() {
        // first init layer
        if (gazetteerLayer == null) {
            gazetteerLayer = new WorldWind.RenderableLayer("GazetteerLayer");           

            for (var i = 0; i < availableRegionsCSV.length; i++) {            
                // create a marker for each point
                var name = availableRegionsCSV[i].name;
                var latitude = availableRegionsCSV[i].center_lat;
                var longitude = availableRegionsCSV[i].center_lon;         
                var diameter = parseFloat(availableRegionsCSV[i].diameter);

                var labelAltitudeThreshold = 0;                

                if (diameter >= 0 && diameter < 10) { 
                    labelAltitudeThreshold = 1.1e3;
                } else if (diameter > 10 && diameter < 20) {
                    labelAltitudeThreshold = 1.7e3;
                } else if (diameter >= 20 && diameter < 40) {
                    labelAltitudeThreshold = 1.2e4;
                } else if (diameter >= 40 && diameter < 60) {
                    labelAltitudeThreshold = 1.7e4;
                } else if (diameter >= 60 && diameter < 80) {
                    labelAltitudeThreshold = 1.2e5;
                } else if (diameter >= 80 && diameter < 100) {
                    labelAltitudeThreshold = 1.7e5;
                } else if (diameter >= 100 && diameter < 200) {
                    labelAltitudeThreshold = 1.2e6;
                } else if (diameter >= 200 && diameter < 400) {
                    labelAltitudeThreshold = 1.7e6;
                } else if (diameter >= 400 && diameter < 600) {
                    labelAltitudeThreshold = 1.2e7;
                } else if (diameter >= 600 && diameter < 1000) {
                    labelAltitudeThreshold = 1.7e7;
                } else if (diameter >= 1000 && diameter < 1400) {
                    labelAltitudeThreshold = 1.2e8;
                } else if (diameter >= 1400 && diameter < 2000) {
                    labelAltitudeThreshold = 1.7e8;
                } else {
                    labelAltitudeThreshold = 1.2e9;
                }


                var placemark = new WorldWind.Placemark(new WorldWind.Position(latitude, longitude, 10), true, null);
                placemark.label = name;
                placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;   

                placemark.eyeDistanceScalingThreshold = labelAltitudeThreshold - 1e5;
                placemark.eyeDistanceScalingLabelThreshold = labelAltitudeThreshold;

                var placemarkAttributes = new WorldWind.PlacemarkAttributes();          
                placemarkAttributes.labelAttributes.color = new WorldWind.Color(0.43, 0.93, 0.97, 1);
                placemarkAttributes.labelAttributes.depthTest = false;
                placemarkAttributes.labelAttributes.scale = 1.2;
                placemarkAttributes.imageScale = 0.8;
                placemarkAttributes.imageSource = "html/images/close.png"; 

                placemark.attributes = placemarkAttributes;


                // as they are small and slow
                if (diameter < MIN_DEFAULT_LOAD) {
                    placemark.enabled = false;
                }

                var obj = {"diameter": diameter};
                placemark.userProperties = obj;


                // add place mark to layer
                gazetteerLayer.addRenderable(placemark);          
            }            

            // Marker layer
            wwd.insertLayer(10, gazetteerLayer);

        } else {
            if (isShowGazetteer === false) {
                gazetteerLayer.enabled = false;           
            } else {                

                // trigger the reload from range diameter
                // reload the gazetteer layer
                if (reloadDimaterRange()) {
                    gazetteerLayer.enabled = true; 
                }
            }
        }                
    }

    //var csv is the CSV file with headers
    function parseCsvToArray(csv) {

        var lines=csv.split("\n");

        var result = [];

        var headers=lines[0].split(",");

        for (var i=1;i<lines.length;i++) {
            var obj = {};
            var currentline=lines[i].split(",");

            for(var j=0;j<headers.length;j++) {
                obj[headers[j]] = currentline[j];
            }

            result.push(obj);

            // just need the text for auto complete
            availableRegions.push(obj.name);
        }

        //return result; //JavaScript object
        return result; //JSON
    }

});


/*
// for each shape record, read the shape record attributes to get necessary fields
function setAttributes(shapeFileAttributes, shapeFileRecord) {
    var name = shapeFileAttributes.values.name;
    // + "\n Lat: " + shapeFileAttributes.values.center_lat + "\n Lon: " + shapeFileAttributes.values.center_lon;

    placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
    placemarkAttributes.depthTest = false;
    placemarkAttributes.imageSource = ps2EndPoint + "/html/images/icons/main-chart/5.png";
    placemarkAttributes.labelAttributes.color = new WorldWind.Color(0.43, 0.93, 0.97, 1);
    placemarkAttributes.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    placemarkAttributes.labelAttributes.depthTest = false;
    placemarkAttributes.labelAttributes.scale = 1.2;


    // this is used by shape records object to set attributes for them
    var obj = {"attributes": placemarkAttributes, "name": name, "altitude": 1000};
    return obj;
}


// Load all the gazetteer from shapefile
function addShapeRecords() {
    if (shapeFile == null) {
        if (clientName === MARS_CLIENT) {
            shapeFile = new WorldWind.Shapefile(localEndPoint + "/html/data/shapefiles/mars/MARS_nomenclature.shp");
        } else if (clientName === MOON_CLIENT) {
            shapeFile = new WorldWind.Shapefile(localEndPoint + "/html/data/shapefiles/moon/MOON_nomenclature.shp");
        }
    }

    // create a new layer
    gazetteerLayer = new WorldWind.RenderableLayer("GazetteerLayer");

    // load shape records from shapefile and decorate them by call back function setAttributes, then return a renderable layer (gazetteerLayer)
    shapeFile.load(null, setAttributes, gazetteerLayer);

    console.log(gazetteerLayer);

    console.log(gazetteerLayer.renderables);
    gazetteerLayer.renderables[0].eyeDistanceScalingLabelThreshold = 1e4;
    gazetteerLayer.renderables[0].eyeDistanceScalingThreshold = 1e4;

    // Marker layer
    wwd.insertLayer(10, gazetteerLayer);
}
*/