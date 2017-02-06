// selected waveLength of product (used to draw line charts)
selectedWaveLengthSpectralLibraryArrayMainChart = [];
selectedWaveLengthSpectralLibraryArrayRatioChart = [];

// selected product value of spectral library
selectedProductValuesSpectralLibraryMainChart = null;
selectedProductValuesSpectralLibraryRatioChart = null;

// the selected spectral library from product dropdown in spectral-library.js
selectedSpectralLibraryArrayMainChart = [];
selectedSpectralLibraryArrayRatioChart = [];

var isLoadedAllSpectralLibrary = false;

$(document).ready(function() {

    // list of spectral files in html/data/spectral-chart
    var availableSpectralArray = ["carbonate", "inosil", "meteor", "moon", "nesosil", "nitrates", "oxide", "phosphate", "phylosil", "rocks", "RT_resamp", "sorosil", "sulfate", "synth", "tectosil", "unconsolidated"];
    var JSON_FILE_TEMPLATE = ps2EndPoint + "/html/data/spectral-library/$FILENAME.json";

    // store the JSON data for each file json
    var spectralLibraryArray = [];

    // Load all the data from spectral library files
    $(function() {
        for (var i = 0; i < availableSpectralArray.length; i++) {
            // closure to get the local variable in each ajax iterator
            (function(i) {
                var jsonFile = JSON_FILE_TEMPLATE.replace("$FILENAME", availableSpectralArray[i]);
                var dataName = availableSpectralArray[i];
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: jsonFile,
                    cache: false,
                    async: true,
                    success: function(data) {
                        var jsonObj = {
                            name: dataName,
                            dataJSON: data
                        };
                        spectralLibraryArray.push(jsonObj);
                        console.log(jsonObj.name);
                    }
                });
            })(i);
        }

        // Then load to category dropdownbox in mainChartDock and ratio-dock (this is called after ajax event is finished)
        $(document).ajaxStop(function() {
            if(isLoadedAllSpectralLibrary === false) {
                console.log("Loaded all spectral library.");
                isLoadedAllSpectralLibrary = true;
                // sort the array first
                spectralLibraryArray = spectralLibraryArray.sort(SortByName);
                console.log(spectralLibraryArray);
                // category dropdown in category
                for (var i = 0; i < spectralLibraryArray.length; i++) {
                    var tmp = "<li id='$CATEGORY_ID'><a href='#' data-value='$DATA'>$NAME</a></li>";
                    // id of category dropdown for selected product of category
                    tmp = tmp.replace("$CATEGORY_ID", spectralLibraryArray[i].name);
                    // upper first character
                    tmp = tmp.replace("$DATA", spectralLibraryArray[i].name);
                    tmp = tmp.replace("$NAME", titleCase(spectralLibraryArray[i].name));
                    // main chart
                    $("#dropDownCategorySpectralLibraryMainChart").append(tmp);
                    // ratio-chart
                    $("#dropDownCategorySpectralLibraryRatioChart").append(tmp);
                }
            }
        });

    });


    // -------- Dropdown Category ----------

    // when change in dropdown category, it will load data to dropdownProduct
    // main chart
    $("#dropDownCategorySpectralLibraryMainChart").on('click', 'li a', function() {
        loadProductDataByCategory($(this), "dropDownProductSpectralLibraryMainChart", "MainChart", selectedWaveLengthSpectralLibraryArrayMainChart, selectedSpectralLibraryArrayMainChart);
    });

    // ratio-chart
    $("#dropDownCategorySpectralLibraryRatioChart").on('click', 'li a', function() {
        loadProductDataByCategory($(this), "dropDownProductSpectralLibraryRatioChart", "RatioChart", selectedWaveLengthSpectralLibraryArrayRatioChart, selectedSpectralLibraryArrayRatioChart);
    });

    // load products sepectral values by category into the dropDownProductID
    function loadProductDataByCategory(categoryObj, dropDownProductID, chartPostfix, selectedWaveLengthSpectralLibraryArrayRef, selectedSpectralLibraryArrayRef) {
        var selectedValue = categoryObj.data('value');
        categoryObj.parents(".dropdown").find('.btn').html("Categories: " + categoryObj.text() + ' <span class="caret"></span>');
        categoryObj.parents(".dropdown").find('.btn').val(selectedValue);

        // Change the button html of dropDownProoductSpectralLibrary to default
        $("#btnProductSpectralLibrary" + chartPostfix).html("Spectral Library Products");

        // Load the product dropdown from selected category dropdown
        // clear the content of product dropdown first
        $("#" + dropDownProductID).empty();

        // the selected category
        var categoryID = selectedValue;

        // Load all the values for the selected product
        for (var i = 0; i < spectralLibraryArray.length; i++) {
            if (spectralLibraryArray[i].name === selectedValue) {
                //console.log(spectralLibraryArray[i].dataJSON);

                var obj = spectralLibraryArray[i].dataJSON;
                // get all the products of selected value
                for (var key in obj)
                {
                    if (obj.hasOwnProperty(key))
                    {
                        // Don't add Wavelength to dropdown box
                        if(key === "Wavelength") {
                            // store the value for the wavelength, not add it to dropdown (obj[key] is an array)
                            // clear the old value first
                            selectedWaveLengthSpectralLibraryArrayRef.length = 0;
                            // need to use shallow copy here
                            for (var j = 0; j < obj[key].length; j++) {
                                selectedWaveLengthSpectralLibraryArrayRef.push(obj[key][j]);
                            }
                        } else {
                            var categoryProductID = categoryID.replace(" ", "_") + "_" + replaceAll(key, " ", "_");
                            var tmp = "<li id='$CATEGORY_ID_PRODUCT_ID'><a href='#' data-value='$DATA' chart-value='$CHART_VALUE'>$NAME</a></li>";

                            // this ID of <li> is used to set color for selected spectral library in dropdown box
                            tmp = tmp.replace("$CATEGORY_ID_PRODUCT_ID", categoryProductID);

                            tmp = tmp.replace("$DATA", key);
                            // This array will be used to draw a line chart
                            tmp = tmp.replace("$CHART_VALUE", obj[key]);
                            // upper first character
                            tmp = tmp.replace("$NAME", titleCase(key));
                            $("#" + dropDownProductID).append(tmp);
                        }
                    }
                }

                // if this category has any selected product, then it need to reload with selected color (spectral library)
                reselectedProductColor(selectedSpectralLibraryArrayRef);

                break;
            }
        }
    }


    //  ------ Dropdown Product ----------

    // draw spectral library chart from selected product (main-chart)
    $("#dropDownProductSpectralLibraryMainChart").on('click', 'li a', function() {
        // pass by reference
        drawSelectedSpectralLibrary($(this), "MainChart", selectedSpectralLibraryArrayMainChart, selectedProductValuesSpectralLibraryMainChart, valuesClickedCoordinateArrayMainChart);
    });


    // ratioChart
    $("#dropDownProductSpectralLibraryRatioChart").on('click', 'li a', function() {
        // pass by reference
        drawSelectedSpectralLibrary($(this), "RatioChart", selectedSpectralLibraryArrayRatioChart, selectedProductValuesSpectralLibraryRatioChart, valuesClickedCoordinateArrayRatioChart);
    });


    // load products sepectral values by category into the dropDownProductID (chartPostfix here is: MainChart, RatioChart)
    function drawSelectedSpectralLibrary(productObj, chartPostfix, selectedSpectralLibraryArrayRef, selectedProductValuesSpectralLibraryRef, valuesClickedCoordinateArrayRef) {
        // get the <li> ID of the selected product item to highlight
        var selectedProductID = productObj.parent().attr('id');

        // if number of drawn spectral library greater than maximum (> 10), then cannot allow to draw new spectral chart
        if (selectedSpectralLibraryArrayRef.length === MAXIMUM_SPECTRAL_LIBRARY_CHARTS && $("#radioBtnAddChart" + chartPostfix).is(':checked')) {
            alert("Cannot draw anymore spectral library, please update the latest only!");
            return;
        }

        // if this spectral library was drawn then it was selected and will not allow to reselect it (but will allow to update the latest)
        for (var i = 0; i < selectedSpectralLibraryArrayRef.length; i++) {
            var productID = selectedSpectralLibraryArrayRef[i];
            if (productID === selectedProductID) {
                alert("Cannot reselect a drawn spectral library");
                return;
            }
        }

        // update the latest selected spectra library with this selected productID
        if ($("#radioBtnUpdateChart" + chartPostfix).is(':checked')) {
            if (selectedSpectralLibraryArrayRef.length > 0) {
                var latestProductID = selectedSpectralLibraryArrayRef[selectedSpectralLibraryArrayRef.length - 1];
                // clear the selected color of it
                $("#" + latestProductID).css("background-color", "white");

                // then update this latest with the new selected productID
                selectedSpectralLibraryArrayRef[selectedSpectralLibraryArrayRef.length - 1] = selectedProductID;
            } else {
                // it is the first spectral library then it will be added as a new one
                selectedSpectralLibraryArrayRef.push(selectedProductID);
            }
        } else {
            // add new spectral library
            // add this selected product to the array to set the color according to the index (color from main-chart.js)
            selectedSpectralLibraryArrayRef.push(selectedProductID);
        }

        var color = spectralLibraryChartColors[selectedSpectralLibraryArrayRef.length - 1];
        // set color to the selected product item
        $("#" + selectedProductID).css("background-color", color);


        productObj.parents(".dropdown").find('.btn').html(productObj.text() + ' <span class="caret"></span>');
        productObj.parents(".dropdown").find('.btn').val(productObj.data('value'));

        var categoryID = selectedProductID.split("_")[0];
        // set the category color to be highlighted
        $("#" + categoryID).css("background-color", "yellow");


        // get the chart-values of spectral library to draw in main chart dock (it is not like {222 33 44} but 222,33,44)
        selectedProductValuesSpectralLibraryRef = Chart_parseFloatsWithComma(productObj.attr('chart-value'));

        // check to draw spectral library chart if a clicked coordinate chart was drawn
        // It has values for second line chart, only draw it if the first line from clicked coordinates has values
        if (valuesClickedCoordinateArrayRef != null) {
            // it will add/update the spectral library in main chart or ratio chart
            if (chartPostfix == "MainChart") {
                MainChart_implementSpectralLibraryChart(true, valuesClickedCoordinateArrayRef, selectedProductValuesSpectralLibraryRef);
            } else {
                RatioChart_implementSpectralLibraryChart(true, valuesClickedCoordinateArrayRef, selectedProductValuesSpectralLibraryRef);
            }
        } else {
            // Change the button html of dropDownProoductSpectralLibrary to default
            $("#btnProductSpectralLibrary" + chartPostfix).html("Spectral Library Products");
            alert("Please click onto coverage to draw a chart first!");
        }
    }


    // when chose another category, the selected product color will need to be reloaded
    function reselectedProductColor(selectedSpectralLibraryArrayRef) {
        for (var i = 0; i < selectedSpectralLibraryArrayRef.length; i++) {
            var productID = selectedSpectralLibraryArrayRef[i];
            var color = spectralLibraryChartColors[i];
            // set color to the selected product item
            $("#" + productID).css("background-color", color);
        }
    }


    function titleCase(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function SortByName(a, b) {
        var aName = a.name.toLowerCase();
        var bName = b.name.toLowerCase();
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }

    function replaceAll(template, target, replacement) {
        return template.split(target).join(replacement);
    };

});
