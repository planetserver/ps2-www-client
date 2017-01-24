// store the json object for landing sites
var landingSitesArray = null;

// check if landing sites are shown
var isShow = false;

// map layer
var landingSitesLayer = null;

// change to ps2EndPoint later
var endPoint = "http://access.planetserver.eu/";

$(document).ready(function() {
    var jsonFile = "";
    if (clientName === MARS_CLIENT) {
        // change here with "ps2EndPoint" later
        jsonFile = endPoint + "/html/data/landing-sites/mars/data.json";
    } else if (clientName === MOON_CLIENT) {
        jsonFile = endPoint + "/html/data/landing-sites/moon/data.json";
    }


    // load the x_axis for charts from file
    $.ajax({
            type: "GET",
            dataType: "json",
            url: jsonFile,
            cache: false,
            async: true,
            success: function(data) {
                landingSitesArray = data;
            }
    });
});


// When click on viewLandingSites button, it will display the place markers
$("#viewLandingSites").click(function(e) {    
    if (isShow === false) {
        isShow = true;
        $(this).text('Hide Landing Sites');

        // create list place markers
        addLandingSites();

    } else {
        isShow = false;
        $(this).text('Show Landing Sites');
        // remove layer
        wwd.removeLayer(landingSitesLayer);
    }
});


// Load all the landing sites as place markers
function addLandingSites() {
    // create a new layer
    landingSitesLayer = new WorldWind.RenderableLayer("landingSitesLayer");

    for (var i = 0; i < landingSitesArray.length; i++) {
        var obj = landingSitesArray[i];

        var placemark = new WorldWind.Placemark(new WorldWind.Position(obj.latitude, obj.longitude, 1e2), true, null);
        placemark.label = "Name: " + obj.name + "\n"
                        + "Date: " + obj.date + "\n"
                        + "Lat: " + obj.latitude + "\n"
                        + "Lon: " + obj.longitude;

        var placemarkAttributes = new WorldWind.PlacemarkAttributes();
        placemarkAttributes.imageScale = 4;
        placemarkAttributes.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
        placemarkAttributes.labelAttributes.scale = 2;
        placemarkAttributes.labelAttributes.depthTest = false;
        placemarkAttributes.leaderLineAttributes.outlineColor = WorldWind.Color.RED;

        if (obj.type === "1") {
            placemarkAttributes.imageSource = endPoint + "/html/images/icons/landing-sites-1.png";
        } else if (obj.type === "2") {
            placemarkAttributes.imageSource = endPoint + "/html/images/icons/landing-sites-2.png";
        } else {
            placemarkAttributes.imageSource = endPoint + "/html/images/icons/landing-sites-3.png";
        }

        placemark.attributes = placemarkAttributes;

        landingSitesLayer.addRenderable(placemark);
    }

    // Marker layer
    wwd.insertLayer(10, landingSitesLayer);
}
