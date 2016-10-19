var allFootPrintsArray = []; // array of all footprints
var MAXIMUM_CHECKED_FOOTPRINTS = 10;
var lastCovID;

var shapes = []; // footprints shape
var attributes = ""; // attirbutes for footprints shape


// Create constructor for dataset object
function DataSetConstructor(coverageID, Easternmost_longitude, Maximum_latitude, Minimum_latitude, Westernmost_longitude, latList, longList, isLoadedImage, centroid_longitude) {
    this.coverageID = coverageID;
    this.Easternmost_longitude = Easternmost_longitude;
    this.Maximum_latitude = Maximum_latitude;
    this.Minimum_latitude = Minimum_latitude;
    this.Westernmost_longitude = Westernmost_longitude;
    this.latList = latList;
    this.longList = longList;

    // check if it is loaded-image or not
    this.isLoadedImage = isLoadedImage;

    this.centroid_longitude = centroid_longitude;
}

function CheckedDataSetConstructor(coverageID, Easternmost_longitude, Maximum_latitude, Minimum_latitude, Westernmost_longitude, latList, longList, latClickedPoint, longClickedPoint, shapeObj, wcpsQuery, centroid_longitude) {
    this.coverageID = coverageID;
    this.Easternmost_longitude = Easternmost_longitude;
    this.Maximum_latitude = Maximum_latitude;
    this.Minimum_latitude = Minimum_latitude;
    this.Westernmost_longitude = Westernmost_longitude;
    this.latList = latList;
    this.longList = longList;


    // store for view to this footprint where user clicked coordinate
    this.latClickedPoint = latClickedPoint;
    this.longClickedPoint = longClickedPoint;

    // store the shape object to set attribute of shape faster
    this.shapeObj = shapeObj;

    // WCPS query to download
    this.wcpsQuery = wcpsQuery;

    this.centroid_longitude = centroid_longitude;
}

// when page loads then load all footprints
var getAllCoverageData = "request=getAllCoverages&type=" + clientName;
$.ajax({
    type: "get",
    url: "http://access.planetserver.eu:8080/ps2/" + "dataset",
    data: getAllCoverageData,
    dataType: 'json',
    cache: false,
    async: false, // this needs time to query all footprints from database and load to WWW then the problem with cache is done.
    success: function(data) {
        $.each(data, function(key, val) {
            var dataSetFootPrint = new DataSetConstructor(val.coverageID, val.Easternmost_longitude, val.Maximum_latitude, val.Minimum_latitude, val.Westernmost_longitude, val.latList, val.longList, false, val.centroid_longitude);

            // push this dataSet to array for displaying later
            allFootPrintsArray.push(dataSetFootPrint);
        });
    }
});

// get footprints containing clicked point for left click
function getFootPrintsContainingPointLeftClick(shapesArray, attributesObj, checkedAttributes, latitude, longitude) {
    // store shapes for check/uncheck
    shapes = shapesArray;

    // clear the array and store new coverages
    leftClickFootPrintsArray = [];

    // store attributes of shapes
    attributes = attributesObj;

    var newClickedFootPrintsArray = [];

    //alert(shapes.length);
    // only load images when click on footprints (and when click to select new footprints)
    var isUpdateCheckedFootPrintsArray = false;
    var getCoveragesContainingPointData = "request=getCoveragesContainingPoint&type=" + clientName + "&latPoint=" + latitude + "&longPoint=" + longitude;
    $.ajax({
        type: "get",
        url: "http://access.planetserver.eu:8080/ps2/" + "dataset",
        data: getCoveragesContainingPointData,
        dataType: 'json',
        cache: false,
        async: false,
        success: function(data) {
	    if(data.length === 0) {
	      return;
	    } else {
            	console.log("Get footprints containing point:" + getCoveragesContainingPointData);
	    }

            $.each(data, function(key, val) {
                var dataSetFootPrint = new CheckedDataSetConstructor(val.coverageID, val.Easternmost_longitude, val.Maximum_latitude, val.Minimum_latitude, val.Westernmost_longitude, val.latList, val.longList, latitude, longitude, null, "", val.centroid_longitude);

                // Get the last clicked coverageID to draw the chart when clicking on loaded image
                lastCovID = val.coverageID;

                // Get all footprints containing points
                leftClickFootPrintsArray.push(dataSetFootPrint);

                console.log("Footprint containing clicked point: " + val.coverageID);

                // check if checkedFootPrintsArray is not over maximum then push to this array
                if (checkedFootPrintsArray.length < MAXIMUM_CHECKED_FOOTPRINTS) {
                    // check if user has chosen this footprint already
                    var isChecked = false;
                    for (var i = 0; i < checkedFootPrintsArray.length; i++) {
                        if (checkedFootPrintsArray[i].coverageID === val.coverageID) {
                            isChecked = true;

                            break;
                        }
                    }

                    // if user has not clicked this footprint then push to checkedFootPrintArray
                    if (isChecked === false) {

                        // user has selected new footprints then need to draw image on it.
                        isUpdateCheckedFootPrintsArray = true;
                        console.log("New checked footprint: " + val.coverageID);

                        // Only load default images on these new checked footprint, not the existing ones.
                        newClickedFootPrintsArray.push(val.coverageID.toLowerCase());

                        // Change footprint to checked footprint
                        for (var j = 0; j < shapes.length; j++) {
                            if (shapes[j]._displayName === val.coverageID) {
                                // Check if footprint is hightlighed or not
                                var isHightLighted = false;

                                for (var k =0; k < hightlightedFootPrintsArray.length; k++) {
                                    if(hightlightedFootPrintsArray[k].coverageID === val.coverageID) {
                                        isHightLighted = true;
                                        break;
                                    }
                                }

                                // If the footprint is not hightlighted then it can be checked
                                if(!isHightLighted) {
                                    shapes[j].attributes = checkedAttributes;

                                    // shape object of checked footprint
                                    dataSetFootPrint.shapeObj = shapes[j];
                                }

                                break;
                            }
                        }

                        checkedFootPrintsArray.push(dataSetFootPrint);
                    }

                    // update the content of dropdown Box
                    updateCheckedFootPrintsDropdownBox();

                } else {
                    alert("A maximum of " + MAXIMUM_CHECKED_FOOTPRINTS + " footprints has been choosen. Please uncheck some before choosing more.");

                }
            });

            // This function is called in landing.js after checkedFootPrintsArray has been updated.
            if (isUpdateCheckedFootPrintsArray) {
                // Load default image on these new checked footprints
                accessCheckedFootPrintsArray(newClickedFootPrintsArray);
            }
        }
    });
}


// get footprints containing clicked point for right click
function getFootPrintsContainingPointRightClick(shapesArray, attributesObj, checkedAttributes, latitude, longitude) {
    // store shapes for check/uncheck
    shapes = shapesArray;

    // store attributes of shapes
    attributes = attributesObj;

    //alert(shapes.length);
    // only load images when click on footprints (and when click to select new footprints)
    var isUpdateCheckedFootPrintsArray = false;

    // clear the containedFootPrintsArray and get the news one from footprint.js
    containedFootPrintsArray = [];

    var getCoveragesContainingPointData = "request=getCoveragesContainingPoint&type=" + clientName + "&latPoint=" + latitude + "&longPoint=" + longitude
    $.ajax({
        type: "get",
        url: "http://access.planetserver.eu:8080/ps2/" + "dataset",
        data: getCoveragesContainingPointData,
        dataType: 'json',
        cache: false,
        async: false,
        success: function(data) {
            console.log("Get footprints containing point for right click:" + getCoveragesContainingPointData);
            $.each(data, function(key, val) {
                var dataSetFootPrint = new CheckedDataSetConstructor(val.coverageID, val.Easternmost_longitude, val.Maximum_latitude, val.Minimum_latitude, val.Westernmost_longitude, val.latList, val.longList, latitude, longitude, false, false, "",
                    val.centroid_longitude);
                console.log("mememe: " + val.coverageID);

                // Get the last clicked coverageID to draw the chart when clicking on loaded image
                lastCovID = val.coverageID;
                //alert("Last clicked footprint: " + lastCovID);

                console.log("Footprints containing right clicked point: " + val.coverageID);

                // add these footprints to menucontext.js
                containedFootPrintsArray.push(dataSetFootPrint);
            });
        }
    });
}


// in checked footprints table, user uncheck row then remove this row and uncheck the footprint also
window.removeCheckedFootPrintRow = function(checkboxObj) {
    //var r = confirm("Do you want to uncheck this footprint?");
    // call this function from Footprints.js to update the content of checked table
    var coverageID = checkboxObj.value;

    // remove this coverageID from checkedFootPrintsArray
    removeCheckedFootPrint(coverageID);

    // update the content of selected dropdown box
    updateCheckedFootPrintsDropdownBox();
}

// this function will remove the checkedCoverage same ID with coverageID and change attribute of this coverage to unchecked
function removeCheckedFootPrint(coverageID) {

    for (var i = 0; i < checkedFootPrintsArray.length; i++) {
        if (checkedFootPrintsArray[i].coverageID === coverageID) {

            if (renderLayer.length > 0) {
                //clear the old loaded image first
                renderLayer[i].removeAllRenderables();

                // remove render layer which contains footprint also
                renderLayer.splice(i, 1);
            }

            // remove coverageID from checkedFootPrintsArray
            checkedFootPrintsArray.splice(i, 1);


            // Change footprint to unchecked footprint
            for (j = 0; j < shapes.length; j++) {
                if (shapes[j]._displayName === coverageID) {
                    shapes[j].attributes = attributes;
                    break;
                }
            }
            break;
        }
    }

    // Remove all the tiling footprints of coverageID (moon client)
    for (var i = renderLayerTiles.length; i--;) {
        if (renderLayerTiles[i]._displayName === coverageID) {
            // clear the tiles loaded image first
            renderLayerTiles[i].removeAllRenderables();

            // remove the footprints tile
            renderLayerTiles.splice(i, 1);
        }
    }

    updateCheckedFootPrintsDropdownBox();
}

function replaceAll(template, target, replacement) {
    return template.split(target).join(replacement);
};


// This function will update the selected drop down box in service-template.html
function updateCheckedFootPrintsDropdownBox() {
    /* Select all selected footprints */
    /*
        <li> <input type='checkbox' class='checkBoxSelectedFootPrints' data='0' id='checkBoxSelectedFootPrints_0' name='type' value='4' style='margin-left: 10px;'/><a class='menuItem' style='display: inline-block;' href='#' data='0' id='linkSelectedFootPrints_0'><b>***All Selected Footprints***</b></a><li role='separator' class='divider' id='checkBoxSelectedFootPrints_Divider_0'></li>
    */

    /*
    Template for 1 menu item
     <li>
        <input type='checkbox' class='checkBoxSelectedFootPrints' data='1' id='checkBoxSelectedFootPrints_1' name='type' value='4' style='margin-left: 10px;' /><a class='menuItem' style='display: inline-block;' href='#' data='1' id='linkSelectedFootPrints_1' value='$COVERAGE_ID'>$COVERAGE_ID</a>
        <a class='removeMenuItem' style='display: inline-block;  margin-left:-26px;' data='1' href='#'><span class='glyphicon glyphicon-remove-circle'></span></a>
    </li>
    <li role='separator' class='divider' id='checkBoxSelectedFootPrints_Divider_1'></li>
    */

    var dropDownContent = "<li> <input type='checkbox' class='checkBoxSelectedFootPrints' data='0' id='checkBoxSelectedFootPrints_0' name='type' value='4' style='margin-left: 10px;'/><a class='menuItem' style='display: inline-block;' href='#' data='0' id='linkSelectedFootPrints_0'><b>***All Selected Footprints***</b></a> <a class='removeMenuItemAll' style='display: inline-block;  margin-left:20px;' data='0' href='#'><span class='glyphicon glyphicon-remove'></span></a> <li role='separator' class='divider' id='checkBoxSelectedFootPrints_Divider_0'></li>";

    var templateRow = "<li> <input type='checkbox' class='checkBoxSelectedFootPrints' data='$COVERAGE_ID' id='checkBoxSelectedFootPrints_$COVERAGE_ID' name='type' value='4' style='margin-left: 10px;'/><a class='menuItem' style='display: inline-block;' href='#' data='$COVERAGE_ID' id='linkSelectedFootPrints_$COVERAGE_ID' value='$COVERAGE_ID'>$COVERAGE_ID</a> <a class='removeMenuItem' style='display: inline-block;' data='$COVERAGE_ID' href='#'><span class='glyphicon glyphicon-remove-circle' style='margin-left: 20px;'></span></a> </li><li role='separator' class='divider' id='checkBoxSelectedFootPrints_Divider_$COVERAGE_ID'></li>";

    for (var i = 0; i < checkedFootPrintsArray.length; i++) { //add if to not update the cov if already exist
        var tmp = replaceAll(templateRow, "$COVERAGE_ID", checkedFootPrintsArray[i].coverageID);
        //tmp = replaceAll(tmp, "$MENU_ITEM_INDEX", (i + 1));

        // add to dropDownBoxContent
        dropDownContent = dropDownContent + tmp;
    }


    $("#dropDownSelectedFootPrints").html(dropDownContent);
}


// This function will remove selectedFootPrints and dropDownSelectedFootPrints
function removeAllSelectedFootPrints() {

    // remove the blue color first
    for (var i = 0; i < checkedFootPrintsArray.length; i++) {

        if (renderLayer.length > 0) {
            //clear the old loaded image first
            renderLayer[i].removeAllRenderables();
        }

        //alert(renderLayer[i]);

        // Change footprint to unchecked footprint
        for (var j = 0; j < shapes.length; j++) {
            if (shapes[j]._displayName === checkedFootPrintsArray[i].coverageID) {

                // uncheck footprints by setting to red color
                shapes[j].attributes = attributes;
            }
        }
    }

    // clear all the temporary tilings footprints (moon client)
    for (var i = 0; i < renderLayerTiles.length; i++) {
        renderLayerTiles[i].removeAllRenderables();
    }

    // then clear array
    checkedFootPrintsArray = [];

    renderLayerTiles = [];

    // clear the dropdown box
    updateCheckedFootPrintsDropdownBox();
}
