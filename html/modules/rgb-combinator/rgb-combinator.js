var wcpsQueriesJSON = ""; // array to store wcpsQueries from server
// Generate dropdown and subdropdown according to the dataset
// Now, set to default 400 bands (TO-DO: store all of these things to dataset metdata in database and get this number from database)
var DEFAULT_BANDS = 438;
var SUBMENU_BANDS = 73;

// when combine with WCPS custom queries will need to stretch it with Python web service
var stretch = false;
var isAllBandsCustomWCPSQueries = 0;

var availableWCPSQueries = []; // store all the WCPS queries from JSON

var selectedFootPrintsArray = []; // store the selected footprints from dropDownSelectedFootPrints

// RGB Bands default for all footprints from WCPS Query
var redBandDefault = "(int)(255 / (max((data.band_233 != 65535) * data.band_233) - min(data.band_233))) * (data.band_233 - min(data.band_233))";
var blueBandDefault = "(int)(255 / (max((data.band_78 != 65535) * data.band_78) - min(data.band_78))) * (data.band_78 - min(data.band_78))";
var greenBandDefault = "(int)(255 / (max((data.band_13 != 65535) * data.band_13) - min(data.band_13))) * (data.band_13 - min(data.band_13))";
var alphaBandDefault = "(data.band_100 != 65535) * 255";

// return the value of Red/Green/Blue band on clicked coordinate
var wcpsQueryRGBValueTemplate = 'for data in ($COVERAGE_ID) return encode({ $QUERY }, "csv")';

// #Object Definition
// Store the WCPS query for each band and load the image RGB
function selectedFootPrint(coverageID, redBand, greenBand, blueBand, isChosen) {
    this.coverageID = coverageID;
    this.redBand = redBand;
    this.greenBand = greenBand;
    this.blueBand = blueBand;

    // If it is true then user want to query RGB on this selected footprint
    this.isChosen = isChosen;
}

// Get RGB value for clicked point on any footprint
window.queryRGBValue = function(coverageID, longitude, latitude, rgbQueryArray) {
    var result = "";

    var queryCombination = [];

    // Query the value for each band
    for(var i = 0; i < rgbQueryArray.length; i++) {
        var bandName = rgbQueryArray[i].name;
        var query = rgbQueryArray[i].query;

        var trimInterval = "[E(" + longitude + ":" + longitude + "), N(" + latitude + ":" + latitude + ")]";

        var value = 0;

        // NEED: to trim to 1 pixel then need to add the trimming interval from WCPS query
        var pattent = /data.band_([0-9]+)/g;

        // Get all the data.band_ from WCPS query
        //alert(bandName + " " + query + " " + rgbQueryArray.length);

        var matches = query.match(pattent);

        // store the unique data band name
        var dataBandArray = [];

        for(var j = 0; j < matches.length; j++) {
            var isExist = false;
            for(var k = 0; k < dataBandArray.length; k++) {
                if(dataBandArray[k].bandName === matches[j]){
                    isExist = true;
                    break;
                }
            }
            // Only add not existing data band name to dataBandArray
            if(!isExist){
                // Add this new data band to dataBandArray
                dataBandArray.push({"bandName" : matches[j]});
            }
        }

        // Now, make the trimming band and replace in query
        for(var j = 0; j < dataBandArray.length; j++) {
            // Add trimming interval to the data.band
            var tmp = "(" + dataBandArray[j].bandName + ") " + trimInterval;
            query = replaceAll(query, dataBandArray[j].bandName, tmp);
        }

        // bandName and query with trimming interval
        queryCombination.push({"name" : bandName,  "query" : query});
    }

    // Create a RGB combination query
    var tmp = "";
    for(var i = 0; i < queryCombination.length; i++) {
        tmp += queryCombination[i].name + ": " + queryCombination[i].query;

        // only add ";" if it is necessary
        if(i == queryCombination.length - 1 || queryCombination.length == 1) {
            tmp = tmp + "";
        } else {
            tmp = tmp + "; ";
        }
    }

    // Get value of band combinations
    var wcpsQuery = wcpsQueryRGBValueTemplate.replace("$COVERAGE_ID", coverageID.toLowerCase()).replace("$QUERY", tmp);

    console.log(ps2WCPSEndPoint + wcpsQuery);

    $.ajax({
        type: "get",
        url: ps2WCPSEndPoint + wcpsQuery,
        cache: false,
        async: true, // this needs time to query all footprints from database and load to WWW then the problem with cache is done.
        success: function(data) {
            console.log("Return value: " + data);
            data = data.substring(2,data.length - 2);

            var tmp = data.split(" ");
            for(var i = 0; i < rgbQueryArray.length; i++) {
                result += rgbQueryArray[i].name + ": " + tmp[i];
                if(i === rgbQueryArray.length - 1 || rgbQueryArray.length === 1) {
                    result += "";
                } else {
                    result += ", ";
                }
            }

            // Update the band results when it is finished
            $("#divRGBValues").html("Digital Values: " + result);
            console.log(result);
        }
    });
}

/* add band WCPS suggestion in RGB bands combination */
$( ".autocomplete" ).autocomplete({
      source: availableWCPSQueries
});


// $(document).ready(function() {

function replaceAll(template, target, replacement) {
    return template.split(target).join(replacement);
};


// return the index of element array by coverageID
function getIndexOfCoveragesArray(array, coverageID) {
    for(var i = 0; i < array.length; i++) {
        if(array[i].coverageID === coverageID) {
            return i;
        }
    }
    return -1;
}

// Set attribute to shape[i] where shape[i] same as coverageID (only for select, hightlight)
function setAttributeToFootPrint(attribute, coverageID) {
    // and add atrribute to shape which has same coverageID
    for (var i = 0; i < checkedFootPrintsArray.length; i++) {
        if (checkedFootPrintsArray[i].coverageID === coverageID) {
            checkedFootPrintsArray[i].shapeObj.attributes = attribute;
            break;
        }
    }
}

// This function will generate the menu items and menu subitems for dropDownRGBBands in service-template.html
loadDropDownRGBBands = function() {
    var menuItems = DEFAULT_BANDS / SUBMENU_BANDS;
    var dropDownContent = "";

    var dropDownRowItemTemplate = '<li class="dropdown-submenu dropdown-toggle" id="rgb_band_dropdown_$MENU_ITEM_INDEX" data-toggle="dropdown">' +
        '<a href="#">Band $MIN_BAND_OF_ITEM - $MAX_BAND_OF_ITEM</a>' +
        '<ul class="dropdown-menu scrollable-sub-menu">'
        //  insert menuSubItems to here
        +
        '$SUBMENU_ITEM_ROW' +
        '</ul>' +
        '</li>' +
        '<li class="divider"></li>';

    var dropDownRowSubItemTemplate = '<li>' +
        '<a href="#">' +
        '$BAND_INDEX' +
        '<div class="rgb_menu btn-group btn-group-xs" id="rgb_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX" data-content="$BAND_INDEX">' +
        '<button type="button" class="btn btn-danger btn-xs" id="rgb_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_red" style="margin-left:20px;">Red</button>' +
        '<button type="button" class="btn btn-success btn-xs" id="rgb_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_green">Green</button>' +
        '<button type="button" class="btn btn-primary btn-xs" id="rgb_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_blue">Blue</button>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '<li class="divider"></li>'
        // rgb_dropdown_1, Band 1 - 50, 1, rgb_band_1_1, rgb_band_1_2

    for (i = 1; i <= menuItems; i++) {
        var MAX_BAND_OF_ITEM = i * SUBMENU_BANDS; // 1 * 50 = 50, 2 * 50 = 100;
        var MIN_BAND_OF_ITEM = (i - 1) * SUBMENU_BANDS // 1, 51

        var dropDownRow = "";
        dropDownRow = dropDownRowItemTemplate.replace("$MENU_ITEM_INDEX", i);
        dropDownRow = dropDownRow.replace("$MIN_BAND_OF_ITEM", MIN_BAND_OF_ITEM + 1);
        dropDownRow = dropDownRow.replace("$MAX_BAND_OF_ITEM", MAX_BAND_OF_ITEM);

        // add sub menu items to band 1 - 50, band 51 - 100
        var dropDownSubItemsRows = "";
        for (j = 1; j <= SUBMENU_BANDS; j++) {
            // Band index = min band of item

            var subMenuItemRow = "";
            subMenuItemRow = replaceAll(dropDownRowSubItemTemplate, "$BAND_INDEX", MIN_BAND_OF_ITEM + j);
            subMenuItemRow = replaceAll(subMenuItemRow, "$MENU_ITEM_INDEX", i);
            subMenuItemRow = replaceAll(subMenuItemRow, "$MENU_SUBITEM_INDEX", j);

            // add sub menu item rows to 1 row
            dropDownSubItemsRows = dropDownSubItemsRows + subMenuItemRow;
        }

        //alert(dropDownSubItemsRows);

        // insert dropDownSubItemsRow to dropDownRow
        dropDownRow = dropDownRow.replace("$SUBMENU_ITEM_ROW", dropDownSubItemsRows);

        // insert dropDownRow to dropDownContent
        dropDownContent = dropDownContent + dropDownRow;
    }

    // add the content to dropDownRGB
    $("#dropDownRGBBands").html(dropDownContent);

}



// this function will load WCPS queries from html/data/wpcs_queries.json (edit here for more queries)
function loadWCPSQueriesJSON() {
    // To add new WCPS query, go to http://www.jsoneditoronline.org/ and paste the minified and see the collapse version, add/modify it in the web

    $.ajax({
        type: "GET",
        url: "http://access.planetserver.eu/html/data/wcps_queries.json",
        data: "{dataset: 'CRISM'}", // it will query later on database with dataset
        cache: false,
        async: false,
        success: function(data) {
            wcpsQueriesJSON = data;
        }
    });


    // And this function will load WCPSQueries for each menuItems to availableWCPSQueries for text suggestion
    var menuItems = wcpsQueriesJSON.wcps_queries; //Object.keys(wcpsObj.wcps_queries); // length of WCPS types (example: 2)
    var menuItemsLength = menuItems.length; // length of menuItems

    // Add all the WCPS queries for each menuItem to array
    for (i = 0; i < menuItemsLength; i++) {
        var subMenuItems = menuItems[i].array;

        for (j = 0; j < subMenuItems.length; j++) {
            availableWCPSQueries.push(subMenuItems[j].name);
        }
    }

}

// This function will generate the menu items and menu subitems for dropDownWCPSBands in service-template.html
loadDropDownWCPSBands = function() {

    /* It is loaded from database but now just load from the JSON array */
    /* Template for each dataset */
    /*
        {
          "WCPS_Queries": [
            { "Ice": [
                  {"name":"Ice 1", "query": "abcdef 1"},
                  {"name":"Ice 2", "query": "abc 2"}
               ],
              "Temperature": [
                  {"name":"Temp 1", "query": "abcdef 1"},
                  {"name":"Temp 2", "query": "abc 2"}
               ]
            }
          ]
        }
    */

    // load WCPS queries from server
    loadWCPSQueriesJSON();

    // and copy the new minified to WCPS_JSON

    // each menu item can has different sub menu items
    var menuItems = wcpsQueriesJSON.wcps_queries; //Object.keys(wcpsObj.wcps_queries); // length of WCPS types (example: 2)
    var menuItemsLength = menuItems.length; // length of menuItems

    var dropDownContent = "";
    var dropDownRowItemTemplate = '<li class="dropdown-submenu dropdown-toggle" id="wcps_band_dropdown_$MENU_ITEM_INDEX" data-toggle="dropdown">' +
        '<a href="#">$WCPS_BAND_CATEGORY</a>' +
        '<ul class="dropdown-menu scrollable-sub-menu">'
        //  insert menuSubItems to here
        +
        '$SUBMENU_ITEM_ROW' +
        '</ul>' +
        '</li>' +
        '<li class="divider"></li>';

    var dropDownRowSubItemTemplate = '<li>' +
        '<a href="#">' +
        '$WCPS_BAND_NAME' +
        '<div class="wcps_menu btn-group btn-group-xs" id="wcps_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX" data-content="$WCPS_BAND_NAME">' +
        '<button type="button" class="btn btn-danger btn-xs" id="wcps_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_red" style="margin-left:10px;">Red</button>' +
        '<button type="button" class="btn btn-success btn-xs" id="wcps_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_green">Green</button>' +
        '<button type="button" class="btn btn-primary btn-xs" id="wcps_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_blue">Blue</button>' +
        '<button type="button" style="margin-left:10px;" id="wcps_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_view_query" class="rgb_wcps_view_query btn btn-info btn-xs" data-title="WCPS query content" data-toggle="clickover" data-content="$WCPS_QUERY" data-placement="right" data-container="body"><span class="glyphicon glyphicon-info-sign"></span>WCPS</button>' +
        '</div>' +
        '</a>' +
        '</li>' +
        '<li class="divider"></li>'
        // wcps_dropdown_1, Band 1 - 50, 1, wcps_band_1_1, wcps_band_1_2


    /*for(i = 0; i < menuItemsObj.length; i++) {
        // sub menu items in array [{"ice 1"}, {"ice 2"}]
        var subMenuItemsObjArray = menuItemsObj[i].array;

        alert(subMenuItemsObjArray.length);
    }

    return; */


    for (i = 0; i < menuItemsLength; i++) {
        var MAX_BAND_OF_ITEM = (i + 1) * SUBMENU_BANDS; // 1 * 50 = 50, 2 * 50 = 100;
        var MIN_BAND_OF_ITEM = (i) * SUBMENU_BANDS // 1, 51

        var dropDownRow = "";
        dropDownRow = dropDownRowItemTemplate.replace("$MENU_ITEM_INDEX", i);

        // Band Ice menu item
        dropDownRow = dropDownRow.replace("$WCPS_BAND_CATEGORY", menuItems[i].name);

        // add sub menu items to band 1 - 50, band 51 - 100
        var dropDownSubItemsRows = "";

        var subMenuItems = menuItems[i].array;

        for (j = 0; j < subMenuItems.length; j++) {
            // Band index = min band of item

            var subMenuItemRow = "";
            subMenuItemRow = replaceAll(dropDownRowSubItemTemplate, "$WCPS_BAND_NAME", subMenuItems[j].name);
            subMenuItemRow = replaceAll(subMenuItemRow, "$MENU_ITEM_INDEX", i);
            subMenuItemRow = replaceAll(subMenuItemRow, "$MENU_SUBITEM_INDEX", j);

            // replace WCPS query in sub menu item
            subMenuItemRow = replaceAll(subMenuItemRow, "$WCPS_QUERY", subMenuItems[j].query);

            // add sub menu item rows to 1 row
            dropDownSubItemsRows = dropDownSubItemsRows + subMenuItemRow;
        }

        //alert(dropDownSubItemsRows);

        // insert dropDownSubItemsRow to dropDownRow
        dropDownRow = dropDownRow.replace("$SUBMENU_ITEM_ROW", dropDownSubItemsRows);

        // insert dropDownRow to dropDownContent
        dropDownContent = dropDownContent + dropDownRow;
    }

    // add the content to dropDownWCPSBands
    $("#dropDownWCPSBands").html(dropDownContent);

}


var rgb_red = {
    id: "",
    value: "",
    lastID: ""
}; // id is the ID of sub-menu item, value is content of sub-menu item, lastID is the lastID of same color
var rgb_green = {
    id: "",
    value: "",
    lastID: ""
};
var rgb_blue = {
    id: "",
    value: "",
    lastID: ""
};

var changeClickIndex = ""; // to know which change button has been clicked

// stop click on dropdown-menu

$('#rgbcombinatordiv .dropdown-menu ').click(function(e) {

    e.stopPropagation();
});

var isPopOVerShow = 0;

/* this is use to open pop up show WCPS query */
$("#dropDownWCPSBands").on("mouseover", ".rgb_wcps_view_query", function(e) {
  /* some click will not work properly */
  $(this).popover();
  //$(this).popover({ html : true, trigger: 'hover', selector: '#dropDownWCPSBands' });
});

/* close all pop up when click out side of menu */
$('body').on('click', function(e) {
    $('.rgb_wcps_view_query').each(function() {
        //the 'is' for buttons that trigger popups
        //the 'has' for icons within a button that triggers a popup
        $(".rgb_wcps_view_query").popover('destroy');
    });
});


function openMenuItemInDropDown(obj) {
    var id = obj.attr('id');

    // This will open the sub menu item
    $("#" + id).addClass('open');
    //console.log($(this).attr('id'));
}

function closeMenuItemInDropDown(obj) {
    // remove all opening submenus
    obj.each(function(index) {
        var id = $(this).attr('id');
        $("#" + id).removeClass('open');
    });
}

// Change button to load the submenu item (it is generated then need to bind item)
$(".dropdown-submenu").on("mouseenter", function() {
    //alert(changeClickIndex);
    //console.log(changeClickIndex);
    openMenuItemInDropDown($(this));
});

// when leave sub menu then hide it
$(".dropdown-submenu").on("mouseleave", function() {
    closeMenuItemInDropDown($(this));
});



// Bind event to added menu item to open list of sub items
$("#dropDownRGBBands").on("mouseenter", ".dropdown-submenu", function() {
    openMenuItemInDropDown($(this));
});


// Bind event to added menu item to close list of sub items
$("#dropDownRGBBands").on("mouseleave", ".dropdown-submenu", function() {
    closeMenuItemInDropDown($(this));
});


// Bind event to added menu item to open list of sub items
$("#dropDownWCPSBands").on("mouseenter", ".dropdown-submenu", function() {
    openMenuItemInDropDown($(this));
});


// Bind event to added menu item to close list of sub items
$("#dropDownWCPSBands").on("mouseleave", ".dropdown-submenu", function() {
    closeMenuItemInDropDown($(this));
});



function clearSubmenuOpen() {
    $(".dropdown-submenu").each(function(index) {
        var id = $(this).attr('id');
        $("#" + id).removeClass('open');
    });
}


// Change button event
$('#txt_rgb_red_change').click(function(e) {
    e.stopPropagation();
    id = rgb_red["id"];
    changeClickIndex = "red";
    if (id.indexOf("rgb") != -1) {
        $("#menu1").dropdown('toggle');
    } else {
        $("#menu2").dropdown('toggle');
    }

    // add lastID of submenu item
    //$("#rgb_band_dropdown_1").addClass('open');
    clearSubmenuOpen();
    $("#" + rgb_red["lastID"]).parent("div").parent("a").parent("li").parent("ul").parent("li").addClass('open');
});

$('#txt_rgb_green_change').click(function(e) {
    e.stopPropagation();
    id = rgb_green["id"];
    changeClickIndex = "green";
    if (id.indexOf("rgb") != -1) {
        $("#menu1").dropdown('toggle');
    } else {
        $("#menu2").dropdown('toggle');
    }
    $("#" + rgb_green["lastID"]).parent("div").parent("a").parent("li").addClass('open');

    // add lastID of submenu item
    //$("#rgb_band_dropdown_1").addClass('open');
    clearSubmenuOpen();
    $("#" + rgb_green["lastID"]).parent("div").parent("a").parent("li").parent("ul").parent("li").addClass('open');
});

$('#txt_rgb_blue_change').click(function(e) {
    e.stopPropagation();
    id = rgb_blue["id"];
    changeClickIndex = "blue";
    if (id.indexOf("rgb") != -1) {
        $("#menu1").dropdown('toggle');
    } else {
        $("#menu2").dropdown('toggle');
    }
    $("#" + rgb_blue["lastID"]).parent("div").parent("a").parent("li").addClass('open');

    // add lastID of submenu item
    //$("#rgb_band_dropdown_1").addClass('open');
    clearSubmenuOpen();
    $("#" + rgb_blue["lastID"]).parent("div").parent("a").parent("li").parent("ul").parent("li").addClass('open');
});


// Catch when click in sub menu item to choose band color (bind event to added sub menu items)
$('#dropDownRGBBands, #dropDownWCPSBands').on("click", ".rgb_menu > button.btn, .wcps_menu > button.btn", function(e) {


    var id = $(this).attr('id');
    var parentID = $(this).parent().attr('id')
    var parentValue = $("#" + parentID).attr('data-content');

    var value = this.innerHTML // (red, green, blue)


    // Red
    if (value === "Red") {
        if (id != rgb_red["lastID"]) {
            // unset last chosen menu item
            $("#" + rgb_red["lastID"]).parent("div").parent("a").parent("li").removeClass("active");

            rgb_red["id"] = parentID; // ID
            rgb_red["value"] = parentValue; // Value
            $('#txt_rgb_red').val(rgb_red["value"]);

            // set lastID to currentID
            rgb_red["lastID"] = id;

            //$(this).addClass("active"); // active current button when it is chosen
            $("#" + rgb_red["lastID"]).removeClass("active"); // last chosed button is not active

            $("#txt_rgb_red_change").removeAttr("disabled");


            // set chosen menu item
            $("#" + parentID).parent("a").parent("li").addClass("active");
        } else {

            // unset chosen menu item
            $("#" + rgb_red["lastID"]).parent("div").parent("a").parent("li").removeClass("active");

            rgb_red["id"] = ""; // ID
            rgb_red["value"] = ""; // Value
            rgb_red["lastID"] = ""; // Last Value
            $('#txt_rgb_red').val("");

            //$(this).removeClass("active"); // remove active button when it is clicked again
            //$("#" + rgb_red["lastID"]).removeClass("active"); // last chosed button is not active

            //$("#txt_rgb_red_change").prop('disabled', true);



        }

    } else if (value === "Green") {
        if (id != rgb_green["lastID"]) {
            // unset last chosen menu item
            $("#" + rgb_green["lastID"]).parent("div").parent("a").parent("li").removeClass("active");

            rgb_green["id"] = parentID; // ID
            rgb_green["value"] = parentValue; // Value
            $('#txt_rgb_green').val(rgb_green["value"]);

            // set lastID to currentID
            rgb_green["lastID"] = id;

            $("#" + rgb_green["lastID"]).removeClass("active"); // last chosed button is not active
            $(this).addClass("active"); // active button when it is chosen

            $("#txt_rgb_green_change").removeAttr("disabled");

            // set chosen menu item
            $("#" + parentID).parent("a").parent("li").addClass("active");
        } else {
            // unset chosen menu item
            $("#" + rgb_green["lastID"]).parent("div").parent("a").parent("li").removeClass("active");

            rgb_green["id"] = ""; // ID
            rgb_green["value"] = ""; // Value
            rgb_green["lastID"] = ""; // Last Value
            $('#txt_rgb_green').val("");

            $(this).removeClass("active"); // remove active button when it is clicked again
            $("#" + rgb_green["lastID"]).removeClass("active"); // last chosed button is not active

            //$("#txt_rgb_green_change").prop('disabled', true);

        }

    } else if (value === "Blue") {
        if (id != rgb_blue["lastID"]) {
            // unset last chosen menu item
            $("#" + rgb_blue["lastID"]).parent("div").parent("a").parent("li").removeClass("active");

            rgb_blue["id"] = parentID; // ID
            rgb_blue["value"] = parentValue; // Value
            $('#txt_rgb_blue').val(rgb_blue["value"]);

            // set lastID to currentID
            rgb_blue["lastID"] = id;

            $(this).addClass("active"); // active button when it is chosen
            $("#" + rgb_blue["lastID"]).removeClass("active"); // last chosed button is not active

            $("#txt_rgb_blue_change").removeAttr("disabled");

            // set chosen menu item
            $("#" + parentID).parent("a").parent("li").addClass("active");
        } else {
            // unset chosen menu item
            $("#" + rgb_blue["lastID"]).parent("div").parent("a").parent("li").removeClass("active");

            rgb_blue["id"] = ""; // ID
            rgb_blue["value"] = ""; // Value
            rgb_blue["lastID"] = ""; // Last Value
            $('#txt_rgb_blue').val("");

            $(this).removeClass("active"); // remove active button when it is clicked again
            $("#" + rgb_blue["lastID"]).removeClass("active"); // last chosed button is not active

            // $("#txt_rgb_blue_change").prop('disabled', true);

        }
    }


});


// This function will check if user want to combine RGB (numers) or WCPS (with some text) to RGB combinations
function isSimpleRGBBand(bandName) {
    if(!isNaN(parseFloat(bandName))) {
        // it is band number
        return true;
    } else {
        // it is wcps query
        return false;
    }
}

// this will only load RGB WCPS queries on loaded image if getBandWCPSQuery set to true
var isSuccessRGBCombination = false;

// This function will return the WCPS query which is used to combine RGB combinations
// targetName is "$RED_BAND", bandName is 1, 2 or BD1500
function getBandWCPSQuery(simpleBandTemplate, targetName, bandName) {

    // Get the WCPS query of bandName (red: wcpsquery);
    var tmp = targetName.split("_")[0]; // $RED
    tmp = tmp.substring(1, tmp.length).toLowerCase();
    tmp = tmp.charAt(0).toUpperCase() + tmp.slice(1);

    var targetNameSubString = tmp; //Red

    // If bandName is number then it will use simpleBandTemplate
    if(isSimpleRGBBand(bandName)) {
        if(bandName > DEFAULT_BANDS || bandName < 0) {
            isSuccessRGBCombination = false;
            alert("Dataset has only maximum: " + DEFAULT_BANDS + " bands.");
        }
        else {
            isSuccessRGBCombination = true;
            return replaceAll(simpleBandTemplate, targetName, bandName);
        }
    } else {
        // else it will return the WCPS query from JSON wcpsQueriesJSON
        var menuItems = wcpsQueriesJSON.wcps_queries; //Object.keys(wcpsObj.wcps_queries); // length of WCPS types (example: 2)
        var menuItemsLength = menuItems.length; // length of menuItems

        var isExist = false;
        // traverse the menuItems and subMenuItems to get the WCPS query of subMenuItem which is same as bandName
        for (i = 0; i < menuItemsLength; i++) {
            var subMenuItems = menuItems[i].array;
            for (j = 0; j < subMenuItems.length; j++) {
                // not need to type upper case
                if (bandName.toLowerCase() === subMenuItems[j].name.toLowerCase()) {

                    isSuccessRGBCombination = true;
                    isAllBandsCustomWCPSQueries += 1;
                    return (targetNameSubString + ":" + subMenuItems[j].query);
                }
            }
        }

        // bandName does not exist in WCPS custom queries
        if(isExist === false) {
            isSuccessRGBCombination = false;
            alert("Your band: " + bandName + " for " + targetNameSubString + " does not exist in WCPS custom queries list.");
        }
    }
}

// button submit RGBCombinations handle
$("#btnSubmitRGBCombination").click(function(e) {
    e.preventDefault();
    e.stopPropagation();


    // If 1 of band is custom WCPS query then need to use stretch service
    isAllBandsCustomWCPSQueries = 0;

    // mostly queries are not stretched.
    stretch = false;

    // not choose any selected footprint
    if (selectedFootPrintsArray.length === 0) {
        alert("You have to choose at least *1 selected footprint* to load WCPS query combination.");
    } else {
        // create WCPS query and load it to selected footprint
        var WCPS_TEMPLATE = 'for data in ( $COVERAGE_ID ) return encode( ' +
            '{'
            // insert bands here
            +
            "$RGB_BANDS" +
            '  alpha: (data.band_100 != 65535) * 255 }, "png", "nodata=null")';

        var RED_BAND = 'Red:   (int)(255 / (max((data.band_$RED_BAND != 65535) * data.band_$RED_BAND) - min(data.band_$RED_BAND))) * (data.band_$RED_BAND - min(data.band_$RED_BAND));'
        var GREEN_BAND = 'Green: (int)(255 / (max((data.band_$GREEN_BAND != 65535) * data.band_$GREEN_BAND) - min(data.band_$GREEN_BAND))) * (data.band_$GREEN_BAND - min(data.band_$GREEN_BAND));'
        var BLUE_BAND = 'Blue:  (int)(255 / (max((data.band_$BLUE_BAND != 65535) * data.band_$BLUE_BAND) - min(data.band_$BLUE_BAND))) * (data.band_$BLUE_BAND - min(data.band_$BLUE_BAND));'

        // Get band numbers from txt_rgb_red, txt_rgb_green, txt_rgb_blue
        var red_band = $("#txt_rgb_red").val().trim();
        var green_band = $("#txt_rgb_green").val().trim();
        var blue_band = $("#txt_rgb_blue").val().trim();

        var rgbCombination = "";

        // 3 combinations
        if (red_band !== "" && green_band !== "" && blue_band !== "") {
            RED_BAND = getBandWCPSQuery(RED_BAND, "$RED_BAND", red_band);
            GREEN_BAND = getBandWCPSQuery(GREEN_BAND, "$GREEN_BAND", green_band);
            BLUE_BAND = getBandWCPSQuery(BLUE_BAND, "$BLUE_BAND", blue_band);

            rgbCombination = RED_BAND + " " + GREEN_BAND + " " + BLUE_BAND;

        }
        // 2 combinations (combine 2 bands will not make alpha bands work then duplicate the seconds band to third band)
        else if (red_band !== "" && green_band !== "") {
            RED_BAND = getBandWCPSQuery(RED_BAND, "$RED_BAND", red_band);
            GREEN_BAND = getBandWCPSQuery(GREEN_BAND, "$GREEN_BAND", green_band);

            rgbCombination = RED_BAND + " " + GREEN_BAND + GREEN_BAND;
        } else if (red_band !== "" && blue_band !== "") {
            RED_BAND = getBandWCPSQuery(RED_BAND, "$RED_BAND", red_band);
            BLUE_BAND = getBandWCPSQuery(BLUE_BAND, "$BLUE_BAND", blue_band);

            rgbCombination = RED_BAND + " " + BLUE_BAND + BLUE_BAND;
        } else if (green_band !== "" && blue_band !== "") {
            GREEN_BAND = getBandWCPSQuery(GREEN_BAND, "$GREEN_BAND", green_band);
            BLUE_BAND = getBandWCPSQuery(BLUE_BAND, "$BLUE_BAND", blue_band);

            rgbCombination = GREEN_BAND + " " + BLUE_BAND + BLUE_BAND;
        }
        // 1 band
        else if (red_band !== "") {
            RED_BAND = getBandWCPSQuery(RED_BAND, "$RED_BAND", red_band);

            rgbCombination = RED_BAND;
        } else if (green_band !== "") {
            GREEN_BAND = getBandWCPSQuery(GREEN_BAND, "$GREEN_BAND", green_band);

            rgbCombination = GREEN_BAND;
        } else if (blue_band !== "") {
            BLUE_BAND = getBandWCPSQuery(BLUE_BAND, "$BLUE_BAND", blue_band);

            rgbCombination = BLUE_BAND;
        }
        // Not choose any band
        else {
            alert("You have to choose at least *1 band* to load on selected footprint.");
            return;
        }

        WCPS_TEMPLATE = replaceAll(WCPS_TEMPLATE, "$RGB_BANDS", rgbCombination);
        // When combine with custom WCPS queries it will need to stretch all bands (first: 0 - 255 then to mean and standard deviation)

        // then call the function to load the image on selected footprint from landing.js
        if(isSuccessRGBCombination === true) {
            // it is success RGB combinations and allow to load new RGB Image on checked footprint
            // Iterate the checkedFootPrintsArray and apply RGB to all
            for (var i = 0; i < selectedFootPrintsArray.length; i++) {
                if(selectedFootPrintsArray[i].isChosen) {
                    // Update the RGB band of selectedFootPrint with the new chosen bands
                    var bands = rgbCombination.split(";"); // red: ... ; green: ...; blue: ....;
                    var hasRed = false;
                    var hasGreen = false;
                    var hasBlue = false;

                    // Update the band with new WCPS query
                    for(var j = 0; j < bands.length - 1; j++) {
                        var tmp = bands[j].split(":");
                        var bandName = tmp[0].trim();
                        var wcpsQuery = tmp[1].trim();

                        if(bandName === "Red") {
                            selectedFootPrintsArray[i].redBand = wcpsQuery;
                            hasRed = true;
                        } else if(bandName === "Green") {
                            selectedFootPrintsArray[i].greenBand = wcpsQuery;
                            hasGreen = true;
                        } else if(bandName === "Blue") {
                            selectedFootPrintsArray[i].blueBand = wcpsQuery;
                            hasBlue = true;
                        }
                    }

                    // If not query on this band then no set WCPS query on it
                    if(!hasRed) {
                        selectedFootPrintsArray[i].redBand = "";
                    }
                    if(!hasGreen) {
                        selectedFootPrintsArray[i].greenBand = "";
                    }
                    if(!hasBlue) {
                        selectedFootPrintsArray[i].blueBand = "";
                    }

                    console.log("Combine bands in WCPS queries: " + selectedFootPrintsArray[i].coverageID);

                    // replace $COVERAGE_ID with selected coverageID and load WCPS combination on checked footprint
                    WCPS_TEMPLATE_QUERY = replaceAll(WCPS_TEMPLATE, "$COVERAGE_ID", selectedFootPrintsArray[i].coverageID.toLowerCase());
                    if(isAllBandsCustomWCPSQueries === 3) {
                        // current encode in PNG has problem when gdalinfo does not ignore NODATA ( = 0 ) then need to use tiff as it will
                        // calculate correctly
                        stretch = true;
                        WCPS_TEMPLATE_QUERY = WCPS_TEMPLATE_QUERY.replace("png", "tiff");
                        console.log("Stretched WCPS query: " + WCPS_TEMPLATE_QUERY);
                    }

                    console.log("WCPS query: " + WCPS_TEMPLATE_QUERY);

                    loadRGBCombinations(WCPS_TEMPLATE_QUERY, selectedFootPrintsArray[i].coverageID.toLowerCase(), stretch);
                }
            }
        }

    }
});


// This is used for selectedFootprints dropdownBox
$(document).ready(function() {

    // pan to selected footprints from dropDownSelectedFootPrints
    function moveToFootPrint(coverageID) {
        for (i = 0; i < checkedFootPrintsArray.length; i++) {
            if (coverageID === checkedFootPrintsArray[i].coverageID) {
                //alert(checkedFootPrintsArray[i].Easternmost_longitude + " " + checkedFootPrintsArray[i].Maximum_latitude);

                //wwd.navigator.range = 8e6; (zoom 5*10^6 meters)
                wwd.goTo(new WorldWind.Location(checkedFootPrintsArray[i].Maximum_latitude, checkedFootPrintsArray[i].Easternmost_longitude));
                break;
            }
        }
    }

    function hightlightSelectedFootPrintsComboBoxItem(obj) {
        // change color when it is selected
        if(obj.css("color") !== "rgb(255, 0, 0)") {
            obj.css("color", "rgb(255, 0, 0)");
                } else {
           obj.css("color", "rgb(0, 0, 0)");
        }
    }

    // toggle all checkboxes when click on select all footprints from dropdown
    $('#dropDownSelectedFootPrintsMenu .dropdown-menu').on("click", "li #linkSelectedFootPrints_0", function(e) {
        var isChecked = $("#checkBoxSelectedFootPrints_0").is(":checked");

        // iterate all the selected footprints and set to check/uncheck
        for(i = 0; i < checkedFootPrintsArray.length; i++) {
            var coverageID = checkedFootPrintsArray[i].coverageID;

            if(!isChecked) {

                // check all selected footprints
                var checkBox = $("#checkBoxSelectedFootPrints_" + coverageID);
                checkBox.prop("checked", true);

                // text color
                var linkSelectedFootPrints = $("#linkSelectedFootPrints_" + coverageID);
                linkSelectedFootPrints.css("color", "rgb(255, 0, 0)")

                // add all selected footprints to array (if it does exist then just update isChosen to true)
                if(selectedFootPrintsArray[i] != null) {
                    selectedFootPrintsArray[i].isChosen = true;
                } else {
                    var obj = new selectedFootPrint(coverageID, redBandDefault, blueBandDefault, greenBandDefault, true);
                    selectedFootPrintsArray.push(obj);
                }

                // Change color to selected footprint
                setAttributeToFootPrint(selectedAttributes, coverageID);
            } else {

                // uncheck all selected footprints
                var checkBox = $("#checkBoxSelectedFootPrints_" + coverageID);
                checkBox.prop("checked", false);

                // text color
                var linkSelectedFootPrints = $("#linkSelectedFootPrints_" + coverageID);
                linkSelectedFootPrints.css("color", "rgb(0, 0, 0)")

                // clear all selected footprints
                selectedFootPrintsArray[i].isChosen = false;

                // Change color to checked footprint
                setAttributeToFootPrint(checkedAttributes, coverageID);
            }
        }

        console.log(selectedFootPrintsArray);
    });

    // toggle button and hight light the text on checkbox all
    $('#dropDownSelectedFootPrintsMenu .dropdown-menu').on("click", "li #checkBoxSelectedFootPrints_0", function(e) {
        var isChecked = $("#checkBoxSelectedFootPrints_0").is(":checked");

        // iterate all the selected footprints and set to check/uncheck
        for(i = 0; i < checkedFootPrintsArray.length; i++) {
            var coverageID = checkedFootPrintsArray[i].coverageID;

            if(isChecked) {
                // check all selected footprints
                var checkBox = $("#checkBoxSelectedFootPrints_" + coverageID);
                checkBox.prop("checked", true);

                // text color
                var linkSelectedFootPrints = $("#linkSelectedFootPrints_" + coverageID);
                linkSelectedFootPrints.css("color", "rgb(255, 0, 0)");

                // add all selected footprints to array (if it does exist then just update isChosen to true)
                if(selectedFootPrintsArray[i] != null) {
                    selectedFootPrintsArray[i].isChosen = true;
                } else {
                    var obj = new selectedFootPrint(coverageID, redBandDefault, blueBandDefault, greenBandDefault, true);
                    selectedFootPrintsArray.push(obj);
                }

                // Change color to selected footprint
                setAttributeToFootPrint(selectedAttributes, coverageID);
            } else {

                // uncheck all selected footprints
                var checkBox = $("#checkBoxSelectedFootPrints_" + coverageID);
                checkBox.prop("checked", false);

                // text color
                var linkSelectedFootPrints = $("#linkSelectedFootPrints_" + coverageID);
                linkSelectedFootPrints.css("color", "rgb(0, 0, 0)");

                // clear all selected footprints
                selectedFootPrintsArray[i].isChosen = false;

                // Change color to checked footprint
                setAttributeToFootPrint(checkedAttributes, coverageID);
            }
        }

        console.log(selectedFootPrintsArray);
    });


    // toggle checkbox when click in menuitem name
    $('#dropDownSelectedFootPrintsMenu .dropdown-menu').on("click", "li .menuItem", function(e) {
        var coverageID = $(this).attr('data');

        // move to selected coverage
        moveToFootPrint(coverageID);

        // toggle checkbox
        var checkBox = $("#checkBoxSelectedFootPrints_" + coverageID);
        checkBox.prop("checked", !checkBox.prop("checked"));

        // change color of selected text
        hightlightSelectedFootPrintsComboBoxItem($(this));

        // add or remove selected footprints from selectedFootPrintsArray
        if(checkBox.prop("checked")) {
            // Not add the "all" value to selected footprints array
            if(coverageID !== "0") {
                // chosen coverageID to selectedFootPrintsArray
                var index = getIndexOfCoveragesArray(selectedFootPrintsArray, coverageID);
                if(index > -1) {
                    selectedFootPrintsArray[i].isChosen = true;
                } else {
                    // Push the new selected footprint to selectedFootPrintsArray
                    var obj = new selectedFootPrint(coverageID, redBandDefault, blueBandDefault, greenBandDefault, true);
                    selectedFootPrintsArray.push(obj);
                }

                // Change color to selected footprint
                setAttributeToFootPrint(selectedAttributes, coverageID);
            }
        } else {
            // unchosen it from selectedFootPrintsArray (if it does exist)
            var index = getIndexOfCoveragesArray(selectedFootPrintsArray, coverageID);
            if(index > -1) {
                selectedFootPrintsArray[i].isChosen = false;
                // Change color to checked footprint
                setAttributeToFootPrint(checkedAttributes, coverageID);
            }
        }

        console.log(selectedFootPrintsArray);

        e.preventDefault();
        return false;
    });

    // toggle button and hight light the text on checkbox
    $('#dropDownSelectedFootPrintsMenu .dropdown-menu').on("click", "li .checkBoxSelectedFootPrints", function(e) {
        var coverageID = $(this).attr('data');
        var linkSelectedFootPrints = $("#linkSelectedFootPrints_" + coverageID);

        var checkBox = $("#checkBoxSelectedFootPrints_" + coverageID);

        var coverageID = $("#linkSelectedFootPrints_" + coverageID).html();
        // move to selected coverage
        moveToFootPrint(coverageID);

        hightlightSelectedFootPrintsComboBoxItem(linkSelectedFootPrints);

        // add or remove selected footprints from selectedFootPrintsArray
        if(checkBox.prop("checked")) {
            // Not add 'all' value to selected footprints array
            if(id !== "0") {
                // chosen coverageID to selectedFootPrintsArray
                var index = getIndexOfCoveragesArray(selectedFootPrintsArray, coverageID);
                if(index > -1) {
                    selectedFootPrintsArray[i].isChosen = true;
                } else {
                    // Push the new selected footprint to selectedFootPrintsArray
                    var obj = new selectedFootPrint(coverageID, redBandDefault, blueBandDefault, greenBandDefault, true);
                    selectedFootPrintsArray.push(obj);
                }

                // Change color to selected footprint
                setAttributeToFootPrint(selectedAttributes, coverageID);
            }
        } else {
            // unchosen it from selectedFootPrintsArray (if it does exist)
            var index = getIndexOfCoveragesArray(selectedFootPrintsArray, coverageID);
            if(index > -1) {
                selectedFootPrintsArray[i].isChosen = false;

                // Change color to checked footprint
                setAttributeToFootPrint(checkedAttributes, coverageID);
            }
        }

        console.log(selectedFootPrintsArray);
    });



    // remove all selected footprins from dropdown click event
    $('#dropDownSelectedFootPrintsMenu .dropdown-menu').on("click", "li .removeMenuItemAll", function(e) {

        var r = confirm("Do you want to remove all selected footprints ?");

        if (r === true) {

            var dropDownContent = "<li> <input type='checkbox' class='checkBoxSelectedFootPrints' data='0' id='checkBoxSelectedFootPrints_0' name='type' value='4' style='margin-left: 10px;'/><a class='menuItem' style='display: inline-block;' href='#' data='0' id='linkSelectedFootPrints_0'><b>***All Selected Footprints***</b></a> <a class='removeMenuItemAll' style='display: inline-block;  margin-left:15px;' data='0' href='#'><span class='glyphicon glyphicon-remove'></span></a> <li role='separator' class='divider' id='checkBoxSelectedFootPrints_Divider_0'></li>";

            // remove after check all menu Item
            $("#dropDownSelectedFootPrints").html(dropDownContent);

            // clear selectedFootPrintsArray
            selectedFootPrintsArray = [];

            // remove all checked footprints
            removeAllSelectedFootPrints();
        }
    });


    // remove selected footprints from dropdown click event
    $('#dropDownSelectedFootPrintsMenu .dropdown-menu').on("click", "li .removeMenuItem", function(e) {
        var id = $(this).attr('data');
        var coverageID = $("#linkSelectedFootPrints_" + id).html();

        var parentMenuItem = $(this).parent();

        var r = confirm("Do you want to remove selected footprint with ID: " + coverageID + "?");
        if (r === true) {

            // remove it from selectedFootPrintsArray;
            var index = getIndexOfCoveragesArray(selectedFootPrintsArray, coverageID);
            selectedFootPrintsArray.splice(index, 1);

            console.log(selectedFootPrintsArray);

            // remove this selected item
            parentMenuItem.remove();

            // remove divider also
            $("#checkBoxSelectedFootPrints_Divider_" + id).remove();

            // uncheck loaded image on footprint
            removeCheckedFootPrint(coverageID);

        }

        e.preventDefault();
        return false;
    });
});

// });
