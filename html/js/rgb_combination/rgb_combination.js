


$(document).ready(function() {


// This will remove checked table and selected drop down in footprints.js
$("#btnClearAllSelectedFootPrints").on('click', function() {
    var r = confirm("Are you sure to unselect all checked footprints?");
    if (r == true) {
        removeAllSelectedFootPrints();
    }
});


 // Generate dropdown and subdropdown according to the dataset
// Now, set to default 400 bands (TO-DO: store all of these things to dataset metdata in database and get this number from database)
var DEFAULT_BANDS = 438;
var SUBMENU_BANDS = 73;

// Change seletected footprints in comboBox
$("#comboBoxSelectedFootPrints").on('change', function() {
    for(i = 0; i < checkedFootPrintsArray.length; i++) {
        if($("#comboBoxSelectedFootPrints").val() === checkedFootPrintsArray[i].coverageID) {
            //alert(checkedFootPrintsArray[i].Easternmost_longitude + " " + checkedFootPrintsArray[i].Maximum_latitude);

            //wwd.navigator.range = 5e6; (zoom 5*10^6 meters)
            wwd.goTo(new WorldWind.Position(checkedFootPrintsArray[i].Maximum_latitude, checkedFootPrintsArray[i].Easternmost_longitude, 10e4));
            break;
        }
    }
});

function replaceAll(template, target, replacement) {
            return template.split(target).join(replacement);
};

// This function will generate the menu items and menu subitems for dropDownRGBBands in service-template.html
loadDropDownRGBBands = function () {
    var menuItems = DEFAULT_BANDS / SUBMENU_BANDS;
    var dropDownContent = "";

    var dropDownRowItemTemplate = '<li class="dropdown-submenu dropdown-toggle" id="rgb_band_dropdown_$MENU_ITEM_INDEX" data-toggle="dropdown">'
                                +   '<a href="#">Band $MIN_BAND_OF_ITEM - $MAX_BAND_OF_ITEM</a>'
                                +   '<ul class="dropdown-menu scrollable-sub-menu">'
                                //  insert menuSubItems to here
                                +    '$SUBMENU_ITEM_ROW'
                                +    '</ul>'
                                +'</li>'
                                +'<li class="divider"></li>';

    var dropDownRowSubItemTemplate =     '<li>'
                                +         '<a href="#">'
                                +              '$BAND_INDEX'
                                +              '<div class="rgb_menu btn-group btn-group-xs" id="rgb_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX" data-content="$BAND_INDEX">'
                                +                  '<button type="button" class="btn btn-danger btn-xs" id="rgb_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_red" style="margin-left:20px;">Red</button>'
                                +                  '<button type="button" class="btn btn-success btn-xs" id="rgb_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_green">Green</button>'
                                +                  '<button type="button" class="btn btn-primary btn-xs" id="rgb_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_blue">Blue</button>'
                                +              '</div>'
                                +         '</a>'
                                +     '</li>'
                                +     '<li class="divider"></li>'
    // rgb_dropdown_1, Band 1 - 50, 1, rgb_band_1_1, rgb_band_1_2

    for(i = 1; i <= menuItems; i++) {
        var MAX_BAND_OF_ITEM = i * SUBMENU_BANDS; // 1 * 50 = 50, 2 * 50 = 100;
        var MIN_BAND_OF_ITEM = (i - 1) * SUBMENU_BANDS  // 1, 51

        var dropDownRow = "";
        dropDownRow = dropDownRowItemTemplate.replace("$MENU_ITEM_INDEX", i);
        dropDownRow = dropDownRow.replace("$MIN_BAND_OF_ITEM", MIN_BAND_OF_ITEM + 1);
        dropDownRow = dropDownRow.replace("$MAX_BAND_OF_ITEM", MAX_BAND_OF_ITEM);

        // add sub menu items to band 1 - 50, band 51 - 100
        var dropDownSubItemsRows = "";
        for(j = 1; j <= SUBMENU_BANDS; j++) {
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


// This function will generate the menu items and menu subitems for dropDownWCPSBands in service-template.html
loadDropDownWCPSBands = function () {

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
    var WCPS_JSON = '{"wcps_queries":[{"name":"Ice","array":[{"name":"Ice 1","query":"for c in (abcdef) return encode(c, rgb)"},{"name":"Ice 2","query":"for c in (sdfsd) return encode(c, rgb)"},{"name":"Ice 3","query":"abc d"}]},{"name":"Temperature","array":[{"name":"Temp 1","query":"abcdef 1"},{"name":"Temp 2","query":"abc 2"}]}]}';

    // To add new WCPS query, go to http://www.jsoneditoronline.org/ and paste the minified and see the collapse version, add/modify it in the web
    // and copy the new minified to WCPS_JSON

    // each menu item can has different sub menu items

    var wcpsObj = JSON.parse(WCPS_JSON);
    var menuItems = wcpsObj.wcps_queries; //Object.keys(wcpsObj.wcps_queries); // length of WCPS types (example: 2)

    var menuItemsLength = menuItems.length; // length of menuItems

    var dropDownContent = "";

    var dropDownRowItemTemplate = '<li class="dropdown-submenu dropdown-toggle" id="wcps_band_dropdown_$MENU_ITEM_INDEX" data-toggle="dropdown">'
                                +   '<a href="#">$WCPS_BAND_CATEGORY</a>'
                                +   '<ul class="dropdown-menu scrollable-sub-menu">'
                                //  insert menuSubItems to here
                                +    '$SUBMENU_ITEM_ROW'
                                +    '</ul>'
                                +'</li>'
                                +'<li class="divider"></li>';

    var dropDownRowSubItemTemplate =     '<li>'
                                +         '<a href="#">'
                                +              '$WCPS_BAND_NAME'
                                +              '<div class="wcps_menu btn-group btn-group-xs" id="wcps_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX" data-content="$WCPS_BAND_NAME">'
                                +                  '<button type="button" class="btn btn-danger btn-xs" id="wcps_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_red" style="margin-left:20px;">Red</button>'
                                +                  '<button type="button" class="btn btn-success btn-xs" id="wcps_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_green">Green</button>'
                                +                  '<button type="button" class="btn btn-primary btn-xs" id="wcps_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_blue">Blue</button>'
                                +                  '<button type="button" style="margin-left:10px;" id="wcps_band_$MENU_ITEM_INDEX_$MENU_SUBITEM_INDEX_view_query" class="rgb_wcps_view_query btn btn-info btn-xs" data-title="WCPS query content" data-toggle="clickover" data-content="$WCPS_QUERY" data-placement="right" data-container="body">View Query</button>'
                                +              '</div>'
                                +         '</a>'
                                +     '</li>'
                                +     '<li class="divider"></li>'
    // wcps_dropdown_1, Band 1 - 50, 1, wcps_band_1_1, wcps_band_1_2


    /*for(i = 0; i < menuItemsObj.length; i++) {
        // sub menu items in array [{"ice 1"}, {"ice 2"}]
        var subMenuItemsObjArray = menuItemsObj[i].array;

        alert(subMenuItemsObjArray.length);
    }

    return; */


    // suppose each menu items only has maximum 50 submenu items


    for(i = 0; i < menuItemsLength; i++) {
        var MAX_BAND_OF_ITEM = (i + 1) * SUBMENU_BANDS; // 1 * 50 = 50, 2 * 50 = 100;
        var MIN_BAND_OF_ITEM = (i) * SUBMENU_BANDS  // 1, 51

        var dropDownRow = "";
        dropDownRow = dropDownRowItemTemplate.replace("$MENU_ITEM_INDEX", i);

        // Band Ice menu item
        dropDownRow = dropDownRow.replace("$WCPS_BAND_CATEGORY", menuItems[i].name);

        // add sub menu items to band 1 - 50, band 51 - 100
        var dropDownSubItemsRows = "";

        var subMenuItems = menuItems[i].array;

        for(j = 0; j < subMenuItems.length; j++) {
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
     $('.dropdown-menu ').click(function(e) {
         e.stopPropagation();
     });

    /* this is use to open pop up show WCPS query */
    $("#dropDownWCPSBands").on("click", ".rgb_wcps_view_query", function() {
        // show the popup by binding event
        $(this).popover();
    });

    /* close all pop up when click out side of menu */
     $('body').on('click', function(e) {
         $('.rgb_wcps_view_query').each(function() {
             //the 'is' for buttons that trigger popups
             //the 'has' for icons within a button that triggers a popup

             if ($('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
             }
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


    // button submit RGBCombinations handle
    $("#btnSubmitRGBCombination").click(function(e) {
        e.preventDefault();

        // Coverage ID in rasdaman is lowercase
        var selectedCoverageID = $("#comboBoxSelectedFootPrints").val().toLowerCase();

        // not choose any selected footprint
        if( selectedCoverageID === "") {
            alert("You have to choose 1 selected footprint to load WCPS query combination");
        } else {
            // create WCPS query and load it to selected footprint
            var WCPS_TEMPLATE = 'for data in ( $COVERAGE_ID ) return encode( '
                              + '{'
                              // insert bands here
                              +  "$RGB_BANDS"
                              + '  alpha: (data.band_100 != 65535) * 255 }, "png", "nodata=null")';

            var RED_BAND =    'red:   (int)(255 / (max((data.band_$RED_BAND != 65535) * data.band_$RED_BAND) - min(data.band_$RED_BAND))) * (data.band_$RED_BAND - min(data.band_$RED_BAND));'
            var GREEN_BAND =  'green: (int)(255 / (max((data.band_$GREEN_BAND != 65535) * data.band_$GREEN_BAND) - min(data.band_$GREEN_BAND))) * (data.band_$GREEN_BAND - min(data.band_$GREEN_BAND));'
            var BLUE_BAND =   'blue:  (int)(255 / (max((data.band_$BLUE_BAND != 65535) * data.band_$BLUE_BAND) - min(data.band_$BLUE_BAND))) * (data.band_$BLUE_BAND - min(data.band_$BLUE_BAND));'

            // Get band numbers from txt_rgb_red, txt_rgb_green, txt_rgb_blue
            var red_band = $("#txt_rgb_red").val().trim();
            var green_band = $("#txt_rgb_green").val().trim();
            var blue_band = $("#txt_rgb_blue").val().trim();

            var rgbCombination = "";

            // 3 combinations
            if(red_band !== "" && green_band !== "" && blue_band !== "") {
                RED_BAND = replaceAll(RED_BAND, "$RED_BAND", red_band);
                GREEN_BAND = replaceAll(GREEN_BAND, "$GREEN_BAND", green_band);
                BLUE_BAND = replaceAll(BLUE_BAND, "$BLUE_BAND", blue_band);

                rgbCombination = RED_BAND + " " + GREEN_BAND + " " + BLUE_BAND;

            }
            // 2 combinations (combine 2 bands will not make alpha bands work then duplicate the seconds band to third bands)
            else if(red_band !== "" && green_band !== "") {
                RED_BAND = replaceAll(RED_BAND, "$RED_BAND", red_band);
                GREEN_BAND = replaceAll(GREEN_BAND, "$GREEN_BAND", green_band);

                rgbCombination = RED_BAND + " " + GREEN_BAND + GREEN_BAND;
            } else if(red_band !== "" && blue_band !== "") {
                RED_BAND = replaceAll(RED_BAND, "$RED_BAND", red_band);
                BLUE_BAND = replaceAll(BLUE_BAND, "$BLUE_BAND", blue_band);

                rgbCombination = RED_BAND + " " + BLUE_BAND + BLUE_BAND;
            } else if(green_band !== "" && blue_band !== "") {
                GREEN_BAND = replaceAll(GREEN_BAND, "$GREEN_BAND", green_band);
                BLUE_BAND = replaceAll(BLUE_BAND, "$BLUE_BAND", blue_band);

                rgbCombination = GREEN_BAND + " " + BLUE_BAND + BLUE_BAND;
            }
            // 1 band
            else if(red_band !== ""){
                RED_BAND = replaceAll(RED_BAND, "$RED_BAND", red_band);

                rgbCombination = RED_BAND;
            } else if(green_band !== ""){
                GREEN_BAND = replaceAll(GREEN_BAND, "$GREEN_BAND", green_band);

                rgbCombination = GREEN_BAND;
            } else if(blue_band !== ""){
                BLUE_BAND = replaceAll(BLUE_BAND, "$BLUE_BAND", blue_band);

                rgbCombination = BLUE_BAND;
            }
            // Not choose any band
            else {
                alert("You have to choose at least 1 band to load on selected footprint!");
                return;
            }

            WCPS_TEMPLATE = replaceAll(WCPS_TEMPLATE, "$COVERAGE_ID", selectedCoverageID);
            WCPS_TEMPLATE = replaceAll(WCPS_TEMPLATE, "$RGB_BANDS", rgbCombination);

            //alert(WCPS_TEMPLATE);

            // then call the function to load the image on selected footprint from landing.js
            loadRGBCombinations(WCPS_TEMPLATE, selectedCoverageID);
        }
    });







     /*var elem = '<div class="well">for c in (mr) return encode(c, "png")</div>' +
         '<button id="close-popover" data-toggle="clickover" class="btn btn-small btn-primary pull-right" onclick="$(&quot;#meddelanden&quot;).popover(&quot;hide&quot;);">Close</button> <br/>';



     $('#meddelanden').popover({animation:true, content:elem, html:true}); */

            // this function is loaded in rgb_combinations.js for RGB Bands
           loadDropDownRGBBands = "";

            // this function is loaded in rgb_combinations.js for WCPS Bands
            loadDropDownWCPSBands = "";

           $(document).ready(function() {

             // load rgb bands to rgbDropDown from rgb_combination.js
             loadDropDownRGBBands();

               // load WCPS custom query to wcpsDropDown from rgb_combinations.js
               loadDropDownWCPSBands();
           });

 });
