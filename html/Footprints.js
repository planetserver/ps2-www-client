// Create constructor for dataset object
function DataSetConstructor(coverageID, Easternmost_longitude, Maximum_latitude, Minimum_latitude, Westernmost_longitude, latList, longList) {
    this.coverageID = coverageID;
    this.Easternmost_longitude = Easternmost_longitude;
    this.Maximum_latitude = Maximum_latitude;
    this.Minimum_latitude = Minimum_latitude;
    this.Westernmost_longitude = Westernmost_longitude;
    this.latList = latList;
    this.longList = longList;
}

function CheckedDataSetConstructor(coverageID, Easternmost_longitude, Maximum_latitude, Minimum_latitude, Westernmost_longitude, latList, longList, latClickedPoint, longClickedPoint) {
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
}

var allFootPrintsArray = []; // array of all footprints
var footPrintsContainingPointArray = []; // array of footprints containing clicked point
var MAXIMUM_CHECKED_FOOTPRINTS = 10;

// when page loads then load all footprints
$.ajax({
    type: "get",
    url: config.serverHost + "dataset",
    data: "request=getAllCoverages",
    dataType: 'json',
    success: function(data) {
        $.each(data, function(key, val) {
            var dataSetFootPrint = new DataSetConstructor(val.coverageID, val.Easternmost_longitude, val.Maximum_latitude, val.Minimum_latitude, val.Westernmost_longitude, val.latList, val.longList);

            // push this dataSet to array for displaying later
            allFootPrintsArray.push(dataSetFootPrint);
        });
    }
});

// get footprints containing clicked point
function getFootPrintsContainingPoint(shapes, attributes, checkedAttributes, latitude, longitude) {
    //alert(shapes.length);
    $.ajax({
        type: "get",
        url: config.serverHost + "dataset",
        data: "request=getCoveragesContainingPoint&latPoint=" + latitude + "&longPoint=" + longitude,
        dataType: 'json',
        //async:false,
        success: function(data) {
            console.log("Get footprints containing point:" + " request=getCoveragesContainingPoint&latPoint=" + latitude + "&longPoint=" + longitude);
            $.each(data, function(key, val) {
                var dataSetFootPrint = new CheckedDataSetConstructor(val.coverageID, val.Easternmost_longitude, val.Maximum_latitude, val.Minimum_latitude, val.Westernmost_longitude, val.latList, val.longList, latitude, longitude);

                // push this dataSet to array for displaying later
                footPrintsContainingPointArray.push(dataSetFootPrint);

                console.log("Footprint containing clicked point: " + val.coverageID);

                // check if checkedFootPrintsArray is not over maximum then push to this array
                if (checkedFootPrintsArray.length < MAXIMUM_CHECKED_FOOTPRINTS) {
                    // check if user has choosen this footprint already
                    var isChecked = false;
                    for (i = 0; i < checkedFootPrintsArray.length; i++) {
                        if (checkedFootPrintsArray[i].coverageID === val.coverageID) {
                            isChecked = true;
                           // var r = confirm("Uncheck this footprint: " + val.coverageID + " ?");
                           // if (r == true) {
                                // remove coverageID from checkedFootPrintsArray and change attribute to unchecked
                            //    removeCheckedFootPrint(val.coverageID)
                           // }
                            break;
                        }
                    }

                    // if user has not clicked this footprint then push to checkedFootPrintArray
                    if (isChecked === false) {
                        checkedFootPrintsArray.push(dataSetFootPrint);
                        console.log("New checked footprint: " + val.coverageID);

                        // Change footprint to checked footprint
                        for (j = 0; j < shapes.length; j++) {
                            if (shapes[j]._displayName === val.coverageID) {
                                shapes[j].attributes = checkedAttributes;
                                break;
                            }
                        }
                    }

                    // update checkedFootPrintsTable in service-template.html
                    updateCheckedFootPrintsTable();


                } else {
                    alert("A maximum of " + MAXIMUM_CHECKED_FOOTPRINTS + " footprints has been choosen. Please uncheck some before choosing more.");

                }
            });

	    // This function is called in landing.js after checkedFootPrintsArray has been updated.
            accessCheckedFootPrintsArray();
        }
    });


    // in checked footprints table, user uncheck row then remove this row and uncheck the footprint also
    window.removeCheckedFootPrintRow = function(checkboxObj) {
        //var r = confirm("Do you want to uncheck this footprint?");
        r = true;
        if (r == true) {
            // call this function from Footprints.js to update the content of checked table
            var coverageID = checkboxObj.value;

            // remove this coverageID from checkedFootPrintsArray
            removeCheckedFootPrint(coverageID);

            // update the content of checked table
            updateCheckedFootPrintsTable();
        }
    }

    // this function will remove the checkedCoverage same ID with coverageID and change attribute of this coverage to unchecked
    function removeCheckedFootPrint(coverageID) {

        for (i = 0; i < checkedFootPrintsArray.length; i++) {
            if (checkedFootPrintsArray[i].coverageID === coverageID) {
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
    }

    String.prototype.replaceAll = function(target, replacement) {
        return this.split(target).join(replacement);
    };

    // update the content of checked foot prints table if user uncheck, add footprints
    window.updateCheckedFootPrintsTable = function() {
        // Template row:
        /*<tr>
        	<td>1</td>
        	<td>HRL00004839_07_IF182L_TRR3</td>
        	<td>
        		<input type="checkbox" id="checkedFootPrintsTable_checked_1" value="HRL00004839_07_IF182L_TRR3" onclick="removeCheckedFootPrintRow(this);" checked>
        	</td>
        	<td>
        		<button type="button" class="btn btn-info" id="checkedFootPrintsTable_view_1" data-content="10_39" onclick="viewCheckedFootPrintRow(this);">
        		      <span class="glyphicon glyphicon-search"></span> View
        		</button>
        	</td>
         </tr>*/
        var tableContent = "";
        var templateRow = "<tr>" +  "<td>$COVERAGE_ID</td>" + "<td>" + " <input type='checkbox' id='checkedFootPrintsTable_checked_$rowNumber' value='$COVERAGE_ID' onclick='removeCheckedFootPrintRow(this);' checked>" + "</td>" + "<td>" + " <button type='button' class='btn btn-info' id='checkedFootPrintsTable_view_$rowNumber' data-content='$LAT_CLICKED_POINT_$LONG_CLICKED_POINT' onclick='viewCheckedFootPrintRow(this);'>" + " <span class='glyphicon glyphicon-search'></span> View" + "</button>" + "</td>" + "</tr>";

        for (i = 0; i < checkedFootPrintsArray.length; i++) {
            var tmp = templateRow.replace("$rowNumber", i + 1);
            tmp = tmp.replaceAll("$COVERAGE_ID", checkedFootPrintsArray[i].coverageID);
            tmp = tmp.replaceAll("$LAT_CLICKED_POINT", checkedFootPrintsArray[i].latClickedPoint);
            tmp = tmp.replaceAll("$LONG_CLICKED_POINT", checkedFootPrintsArray[i].longClickedPoint);

            // add to tableContent
            tableContent = tableContent + tmp;
        }

        // finally, update checkedFootPrintsTable content with tableContent
        $("#checkedFootPrintsTable").html(tableContent);
    }
}
