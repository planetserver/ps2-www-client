$( document ).ready(function() {

    

    // Hide context menu when left click
     $("body").click(function(e) {
        // Only close menu context when left click
            $("#menuContext").hide();
            $("#menuContext").css("top", "");
            $("#menuContext").css("left", "");        
    });

        
    // Just don't close the submenu of menucontext
    $("#menuContext").menu({
        select: function(e, ui) {
            $("#menuContext").menu("focus", e, ui.item);
        }
    });

    function replaceAll(template, target, replacement) {
        return template.split(target).join(replacement);
    };


    // stop when left click on menu context
    $("#menuContext").on("click", function(e) {
        e.stopPropagation();
    });


    // return object of array by coverageID
    function getObjectFromArray(array, coverageID) {
        for(var i = 0; i < array.length; i++) {
            if(array[i].coverageID === coverageID) {
                return array[i];
            }
        }
    }


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
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i]._displayName === coverageID) {
                shapes[i].attributes = attribute;
                break;
            }
        }
    }




    // remove the element of array by coverageID (only for hightlight)
    function removeElementArrayByCoverageID(array, coverageID) {
        for (i = 0; i < array.length; i++) {
            if (array[i].coverageID === coverageID) {

                // remove coverageID from array
                array.splice(i, 1);
            }
        }
    }

    // -------- MenuContext submenu item click

    // Select link click bind
    $("#menuContext").on("click", ".menuContext_select", function(e) {      
        e.stopPropagation(); 
        var coverageID = $(this).attr("data");

        // unselect
        if(isSelectedCoverage(coverageID)){
            // Remove checked footprint
            removeCheckedFootPrint(coverageID);

            // Update the content of selected footprints dropdown also
            updateCheckedFootPrintsDropdownBox();

            // check if it is hightlighted
            var index = getIndexOfCoveragesArray(hightlightedFootPrintsArray, coverageID);

            if(index > -1) {
                setAttributeToFootPrint(hightlightedAttributes, coverageID);
            }
        } else {
            // add checked footprint to selectedFootPrintsArray
            var checkedFootPrintObj = getObjectFromArray(containedFootPrintsArray, coverageID);
            console.log(checkedFootPrintObj);
            checkedFootPrintsArray.push(checkedFootPrintObj);

            // and add atrribute to shape which has same coverageID
            setAttributeToFootPrint(checkedAttributes, coverageID);

            // This function is called in landings.js after checkedFootPrintsArray has been updated. 
            accessCheckedFootPrintsArray(); 

            // Update the content of selected footprints dropdown also
            updateCheckedFootPrintsDropdownBox();
        }

        // update the menu context
        updateMenuContext();
        return false;
    });


    var lastCoverageHightLightTmp = "";

    // --- menu item mouse over / mouse out ----
    // Hightlight when focus on menuItem for shorttime
    $("#menuContext").on("mouseover", ".menuContext_hightlightTmp", function(e) {
        
        //e.stopPropagation(); 
        var coverageID = $(this).attr("data");

        lastCoverageHightLightTmp = coverageID;

        // hightlight it when mouseover
        setAttributeToFootPrint(hightlightedAttributes, coverageID);

    });

    // Unhightlight when mouse out
    $("#menuContext").on("mouseout", ".menuContext_hightlightTmp", function(e) {
        
        //e.stopPropagation(); 
        var coverageID = $(this).attr("data");

        lastCoverageHightLightTmp = "";

        // If it is hightligheted then don't do anything
        var index = getIndexOfCoveragesArray(hightlightedFootPrintsArray, coverageID);
        if(index == -1) {
            // set color of footprint to blue/red depend on its status
            var index = getIndexOfCoveragesArray(checkedFootPrintsArray, coverageID);
            if(index > -1) {
                // and add atrribute to shape which has same coverageID
                setAttributeToFootPrint(checkedAttributes, coverageID);
            } else {
                setAttributeToFootPrint(defaultAttributes, coverageID);
            }
        }      
    });


  
    // Hightlight link click bind
    $("#menuContext").on("click", ".menuContext_hightlight", function(e) {      
        e.stopPropagation(); 
        var coverageID = $(this).attr("data");

        // Unhightlight the element
        if(isHightLightedCoverage(coverageID)){

            // remove hightlight element array from hightlightedFootPrintsArray
            removeElementArrayByCoverageID(hightlightedFootPrintsArray, coverageID);

            // set color of footprint to blue/red depend on its status
            var index = getIndexOfCoveragesArray(checkedFootPrintsArray, coverageID);
            if(index > -1) {
                // and add atrribute to shape which has same coverageID
                setAttributeToFootPrint(checkedAttributes, coverageID);
            } else {
                setAttributeToFootPrint(defaultAttributes, coverageID);
            }

        } else {
            // and add atrribute to shape which has same coverageID
            setAttributeToFootPrint(hightlightedAttributes, coverageID);

            var obj = {
                "coverageID": coverageID
            }
            // push coverageID to the hightlightedFootPrintsArray
            hightlightedFootPrintsArray.push(obj);
        }

        // update the menu context
        updateMenuContext();
        return false;
    });   
    

    // Check if coverageID already selected
    function isSelectedCoverage(coverageID) {
        for(var i = 0; i < checkedFootPrintsArray.length; i++) {
            if(coverageID === checkedFootPrintsArray[i].coverageID) {
                return true;
            }
        }
        return false;
    }

    // Check if coverageID already hightlighted
    function isHightLightedCoverage(coverageID) {

        for(var i = 0; i < hightlightedFootPrintsArray.length; i++) {
            if(coverageID === hightlightedFootPrintsArray[i].coverageID) {
                return true;
            }
        }
        return false;
    }


    // This function will work the same as left click in landing.js but will only show menu context
    rightClickMenuContext = function (o) {
        // X and Y coordinates of a single click
        var x = o.clientX,
            y = o.clientY;
        //console.log("The coordinates are: " + x + " " + y);
        var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

        if (pickList.objects[0] != null) {
            // Get the clicked point (if it clicks on the globe then use object[0] or click on loaded image then use object[1])
            var clickedLatitude = pickList.objects[0].position != null ? pickList.objects[0].position.latitude : pickList.objects[1].position.latitude;
            var clickedLongitude = pickList.objects[0].position != null ? pickList.objects[0].position.longitude : pickList.objects[1].position.longitude;

            // get last footprint which contains the new clicked point (load image by synchronous)
            $.when(getFootPrintsContainingPointRightClick(shapes, attributes, checkedAttributes, clickedLatitude, clickedLongitude)).then(function() {

                // only show menu when click on a footprint
                if(containedFootPrintsArray.length > 0) {
                    // then build menu context
                   updateMenuContext();

                }
            });
        } 
    }


    // Create menu context when right click
    function updateMenuContext() {

        var menuContextContentTemplate = ' <li style="font-weight: bold;font-size: 14px;background-color: #203864;color: white;"><span class="glyphicon glyphicon-globe"></span>Available Coverages</li> $MENUCONTEXT_ITEMS';
        
        /* menu context sub item 

            <li><a href="#" id="menuContext_$COVERAGEID">$COVERAGEID</a>
                <ul>
                    <li style="font-weight: bold;font-size: 14px;background-color: #E01B1B;color: white;"><span class="glyphicon glyphicon-tasks"></span>Functions</li>
                    <li><a href="#" id="menuContext_$COVERAGEID_hightlight" class="menuContext_hightlight">
                        <span class="glyphicon glyphicon-stop" style="color:green;"></span> <input type="checkbox">&nbsp;Hightlight Footprint
                    </a></li>
                            <li><a href="#" id="menuContext_$COVERAGEID_select" class="menuContext_select">
                        <span class="glyphicon glyphicon-ok-circle" style="color:blue;"></span>Select Footprint
                    </a></li>
                 </ul>
            </li>
        */

        // When focus on the menu Item, it will hightlight but for short time
        var menuContextItemTemplate = '<li><a href="#" id="menuContext_$COVERAGEID" class="menuContext_hightlightTmp" data="$COVERAGEID">$COVERAGEID</a>$MENUCONTEXT_SUBITEMS</li>';
        var menuContextSubItemTemplate = '<ul class=".menuContext_functions" data="$COVERAGEID"><li style="font-weight: bold;font-size: 14px;background-color: #E01B1B;color: white;"><span class="glyphicon glyphicon-tasks"></span>Functions</li>$MENUCONTEXT_SUBITEMS_FUNCTIONS</ul>';

        // check
        var hightLightSubMenuItemTemplate = '<li><a href="#" id="menuContext_$COVERAGEID_hightlight" class="menuContext_hightlight" data="$COVERAGEID"> <span class="glyphicon glyphicon-arrow-up" style="color:green;"></span>Lock On Footprint</a></li>';
        var selectSubMenuItemTemplate = '<li><a href="#" id="menuContext_$COVERAGEID_select" class="menuContext_select" data="$COVERAGEID"> <span class="glyphicon glyphicon-signal" style="color:blue;"></span>Select Footprint </a></li>';

        // uncheck
        var unHightLightSubMenuItemTemplate = '<li><a href="#" id="menuContext_$COVERAGEID_unhightlight" class="menuContext_hightlight" data="$COVERAGEID"> <span class="glyphicon glyphicon-sort" style="color:green;"></span>Unlock On Footprint</a></li>';
        var unSelectSubMenuItemTemplate = '<li><a href="#" id="menuContext_$COVERAGEID_unselect" class="menuContext_select" data="$COVERAGEID"> <span class="glyphicon glyphicon-remove-circle" style="color:blue;"></span>Unselect Footprint </a></li>';

        var menuContextItems = "";

        //  Get all the contained footprints
        for(var i = 0; i < containedFootPrintsArray.length; i++) {

            var menuContextSubItem = "";
            var coverageID = containedFootPrintsArray[i].coverageID;     

            // Menu context sub items
            var menuContextSubItemFunctions = "";


                // select
                if(!isSelectedCoverage(coverageID)) {
                    menuContextSubItemFunctions += replaceAll(selectSubMenuItemTemplate, "$COVERAGEID", coverageID);
                } else {
                    menuContextSubItemFunctions += replaceAll(unSelectSubMenuItemTemplate, "$COVERAGEID", coverageID);
                }

                // hightlight
                if(!isHightLightedCoverage(coverageID)) {
                    menuContextSubItemFunctions += replaceAll(hightLightSubMenuItemTemplate, "$COVERAGEID", coverageID);
                } else {
                    menuContextSubItemFunctions += replaceAll(unHightLightSubMenuItemTemplate, "$COVERAGEID", coverageID);
                }                 

            
            // update submenu item functions to sub menu item
            var menuContextSubItem = menuContextSubItemTemplate.replace("$MENUCONTEXT_SUBITEMS_FUNCTIONS", menuContextSubItemFunctions);
            menuContextSubItem = replaceAll(menuContextSubItem, "$COVERAGEID", coverageID);

            // update submenu item to menu item
            var menuContextItem = replaceAll(menuContextItemTemplate, "$COVERAGEID", coverageID);
            menuContextItem = menuContextItem.replace("$MENUCONTEXT_SUBITEMS", menuContextSubItem);
            // menu items
            menuContextItems += menuContextItem;

        }

        menuContextContent = menuContextContentTemplate.replace("$MENUCONTEXT_ITEMS", menuContextItems);

        // Update the new menu content to menucontext
        $("#menuContext").html(menuContextContent);

        $("#menuContext").menu("refresh"); // reload menu context with new items
    }

});
