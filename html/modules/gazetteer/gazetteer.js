// check if landing sites are shown
var isShow = false;

// map layer
var gazetteerLayer = null;

// change to ps2EndPoint later
var localEndPoint = "http://localhost:8080";

// object
var shapeFile = null;


// When click on viewGazetteer button, it will display the place markers
$("#viewGazetteer").click(function(e) {    
    if (isShow === false) {
        isShow = true;
        $(this).text('Hide Gazetteer');

        // load the records from shapefile
        addShapeRecords();
    } else {
        isShow = false;
        $(this).text('Show Gazetteer');
        // remove layer
        wwd.removeLayer(gazetteerLayer);
    }
});


// for each shape record, read the shape record attributes to get necessary fields
function setAttributes(shapeFileAttributes, shapeFileRecord) {        
    var name = shapeFileAttributes.values.name + "\n Lat: " + shapeFileAttributes.values.center_lat + "\n Lon: " + shapeFileAttributes.values.center_lon;
    placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
    placemarkAttributes.depthTest = false;
    placemarkAttributes.imageSource = ps2EndPoint + "/html/images/icons/main-chart/5.png";        
    placemarkAttributes.labelAttributes.color = new WorldWind.Color(0.43, 0.93, 0.97, 1);
    placemarkAttributes.labelAttributes.depthTest = false;
    placemarkAttributes.labelAttributes.scale = 1.2;

    // this is used by shape records object to set attributes for them
    var obj = {"attributes": placemarkAttributes, "name": name};
    return obj;
}


// Load all the gazetteer from shapefile
function addShapeRecords() {
    if (shapeFile == null) {
        if (clientName === MARS_CLIENT) {        
            shapeFile = new WorldWind.Shapefile(localEndPoint + "/html/data/shapefiles/mars/MARS_nomenclature.shp");
        } else if (clientName === MOON_CLIENT) {
            shapeFile = new WorldWind.Shapefile(localEndPoint + "/html/data/shapefiles/mars/MARS_nomenclature.shp");
        }
    }    

    // create a new layer
    gazetteerLayer = new WorldWind.RenderableLayer("GazetteerLayer");

    // load shape records from shapefile and decorate them by call back function setAttributes, then return a renderable layer (gazetteerLayer)
    shapeFile.load(null, setAttributes, gazetteerLayer);   

    // Marker layer
    wwd.insertLayer(10, gazetteerLayer);
}
