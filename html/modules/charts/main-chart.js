// This function will get the WCPS query value for all the bands of clicked coordinate
MainChart_valuesClickedCoordinateArray = null;

// All the obj for line charts are stored (not for the spectral library)
// store the data provider for multiple charts
dataProviderChartsArray = [];

// All the obj for spectral library charts (not for clicked chart)
spectralLibraryDataProviderChartsArray = [];

MAXIMUM_SPECTRAL_LIBRARY_CHARTS = 5;
MAXIMUM_LINECHARTS = 10;

CLICKED_ICON_PATH = "html/images/icons/main-chart/";


spectralLibraryChartColors = ["#FAF508", "#7ED15A", "#9B89B8", "#54C9C9", "#48E9B2"];

// the selected spectral library from product dropdown in spectral-library.js
selectedSpectralLibraryArray = [];

// Number of line charts and spectral library
var lineChartsCount = 0;

var chartColors = ["#7EF10A", "#9B59B6", "#5499C7", "#48C9B0", "#58D68D", "#F4D03F", "#DC7633", "#00FFFF", "#FF00FF", "#FF0000"];

// This array has all objects for drawing chart with default range charts (i.e: 1-4 in wavelength)
var defaultCombinedArrayCharts = null;

// store the clicked coordinates to add the place markers
placeMarkersArray = [];


// check if a line chart is drawn
MainChart_isAddedALineChart = false;

// Handle change event of range charts text box (only after drawing chart)
$('#txtRangeChartsMainChart').keypress(function (e) {
    var key = e.which;
    if(key == 13)  // the enter key code
    {
        filterRangeCharts();
    }
});


// find in arrayLineChart1 a wavelength which is as same as wavelengthValue or is the smaller one but approximate this value
function MainChart_getIdenticalValue(wavelength, spectralObjArray) {
    var max = 0;
    var identicalValue = 0;
    var maxIndex = 0;
    for(var i = 0; i < spectralObjArray.length; i++) {
        if(wavelength === spectralObjArray[i].wavelength) {
            identicalValue = spectralObjArray[i].reflectance;
            return identicalValue;
        } else if (max <= wavelength) {
            max = spectralObjArray[i].wavelength;
            maxIndex = i;
            if(max > wavelength) {
                break;
            }
        }
    }

    // It cannot find the identical wavelength of line chart 1 in line chart 2, then use the approximate value
    identicalValue = spectralObjArray[maxIndex].reflectance;
    return identicalValue;
}

// WCPS query and get data for line chart
function MainChart_getQueryResponseAndSetChart(query) {

    // Only when add chart is selected
    if($("#radioBtnAddChartMainChart").is(':checked')) {
        if(lineChartsCount > MAXIMUM_LINECHARTS) {
            alert("Maximum line charts is: " + MAXIMUM_LINECHARTS);
            return;
        }
    }

    // Get values for clicked chart
    $.ajax({
        type: "get",
        url: query,
        success: function(data) {
            var parsedFloats = [];
            MainChart_valuesClickedCoordinateArray = Chart_parseFloats(data);

            // only click on the footprint to get values from coordinate
            MainChart_implementChart(false, MainChart_valuesClickedCoordinateArray, selectedProductValuesSpectralLibrary);

        }
    });
}


// Object constructor for data line
function SpectralDataConstructorLine(wavelength, reflectance) {
    this.wavelength = wavelength;
    this.reflectance = reflectance;
}

function PlaceMarkerConstructor(latitude, longitude, iconPath) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.iconPath = iconPath;
}

// From clicked chart values, parse it and calculate the coresspondent wavelength
function MainChart_handleClickedChartValues(floatsArray) {
    // combine array values from clicked coordinate and spectral library
    var spectralDataProviderChart = [];

    // This is for the clicked coordinate from WCPS
    var xDist = 3.00913242 / floatsArray.length; // Value for setting the equidistance Band wavelength which should be between 1 and 4
    var xPrev = 1.0; // Value used for storing the Band wavelength of the previous Band
    var Ymin = Infinity,
        Ymax = -Infinity; // Values for getting the minimum and maximum out of the array

    for (var i = 0; i < floatsArray.length; i++) {
        // Only get points with valid value
        var relectance = floatsArray[i];

        var spectralObj = new SpectralDataConstructorLine(parseFloat(xPrev).toFixed(3), relectance);
        spectralDataProviderChart.push(spectralObj);

        if (Ymin > floatsArray[i]) { // Getting the minimum of value to draw chart
            Ymin = floatsArray[i];
        } else if (Ymax < floatsArray[i]) { // Getting the maximum of value to draw chart
            Ymax = floatsArray[i];
        }

        // If point value is valid or not valid still need to calculate the X coordinate for it.
        xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
    }

    return spectralDataProviderChart;
}


// Create array of object from spectral data values
function MainChart_handleSpectralChartValues(spectralFloatsArray) {
    // Store the data for the line 0
    var spectralLibraryDataProviderChart = [];

    // This is for the spectral library of product from category
    // only when select product dropdown in spectral library spectralFloatsArray will have values to draw second line chart
    if(spectralFloatsArray != null) {

        for (var i = 0; i < spectralFloatsArray.length; i++) {
            // Only get points with valid value
            var relectance = spectralFloatsArray[i];

            // wavelength is selected wavelength from spectral library
            var wavelength = selectedWaveLengthSpectralLibrary[i];
            var spectralObj = new SpectralDataConstructorLine(parseFloat(wavelength).toFixed(3), relectance);
            spectralLibraryDataProviderChart.push(spectralObj);
        }
    }

    return spectralLibraryDataProviderChart;
}


// it needs to match the wavelength from spectra library charts and 1 clicked value chart (i.e: they don't have same wavelength points and cannot draw charts if they are not matched)
function MainChart_approximateSpectralValues(spectralDataProviderChart) {
     // store the array for matching spectral library charts and 1 clciked value chart
    var spectralDataProviderChartMatched = [];

    for (var i = 0; i < spectralDataProviderChart.length; i++) {
        var wavelength = spectralDataProviderChart[i].wavelength;

        // create object to store the wavelength and reflectance from matched of all spectral library charts
        var obj = {};
        obj["wavelength"] = wavelength;

        // match all the added spectral library
        for (var j = 0; j < spectralLibraryDataProviderChartsArray.length; j++) {
            var spectralLibraryDataProviderChart = spectralLibraryDataProviderChartsArray[j];

            // get the reflectance from the identical wavelength of clicked value chart and all the spectral library charts
            var reflectance = MainChart_getIdenticalValue(wavelength, spectralLibraryDataProviderChart);

            var reflectanceIndex = "sl_reflectance" + j;
            obj[reflectanceIndex] = reflectance;
        }

        spectralDataProviderChartMatched.push(obj);
    }

    // This stores the matched wavelength between the spectral library charts and clicked charts (i.e: all has the same wavelength points in charts)
    // and the range is from 1 - 4
    return spectralDataProviderChartMatched;
}



$(function() {
    // clear all the drawn charts, with the spectral library charts
    $("#btnClearChartsMultipleCharts").click(function() {
        if(!MainChart_isAddedALineChart) {
            alert("Please click on a footprint to retrieve the spectra first!");
            return;
        }

        // If a line chart is drawn
        var ret = confirm("Do you want to remove all charts?");
        if(ret) {

            // clear all the spectral library charts (selected color from <li> of selected category and product)
            for (var i = 0; i < selectedSpectralLibraryArray.length; i++) {
                var productID = selectedSpectralLibraryArray[i];
                var categoryID = productID.split("_")[0];

                $("#" + categoryID).css("background-color", "white");
                $("#" + productID).css("background-color", "white");
            }

            // then clear this selected color array
            selectedSpectralLibraryArray = [];

            // remove the data provider array for clicked charts
            dataProviderChartsArray = [];

            // remove the data provider array for spectral library charts
            spectralLibraryDataProviderChartsArray = [];

            // remove all the clicked drawn charts
            MainChart_isAddedALineChart = false;

            // remove the place marker array
            placeMarkersArray = [];

            // remove the drawn line charts by remove all the data, and the spectral line charts
            MainChart_valuesClickedCoordinateArray = null;
            selectedProductValuesSpectralLibrary = null;
            var floatsArray = [];

            // clear all the drawn line charts here
            drawChart([]);

            // clear all the clicked points
            placemarkLayer.removeAllRenderables();
        }
    });

});


// Combined the matched between spectral library charts and clicked value charts with wavelength from clicked value
// Then, it creates all the values from spectral library charts and clicked value charts to 1 array of objects to draw all the charts
function MainChart_CombineDataProviders(spectralDataProviderChartMatched) {

    var combinedArray = [];

    // creat an array of objects which has 1 wavelength and multiple reflectance indexes
    // array({wavelength, reflectance0, reflectance1}, {wavelength, reflectance0, reflectane1})
    // spectral library is always reflectance0

    // all arrays have same number of wavelength and the wavelength starts from 1 - 4 (as origin is from a clicked value chart)
    var numberOfWavelength = spectralDataProviderChartMatched.length;

    // wavelength from 1 - 4 (as it is in spectralDataProviderChartMatched)
    for (var i = 0; i < numberOfWavelength; i++) {
        var obj = null;
        try {

            // get the matched obj from all spectral library charts
            obj = spectralDataProviderChartMatched[i];
            var wavelength = obj.wavelength;

            // get all the reflectance from the clicked value charts
            for (var j = 0; j < dataProviderChartsArray.length; j++) {
                // clicked value chart
                var reflectanceIndex = "reflectance" + j;
                // reflectance from clicked value can be null
                obj[reflectanceIndex] = dataProviderChartsArray[j][i].reflectance;
            }
        } catch(err) {
            console.log("wavelengh index: " + i);
            return;
        }

        // obj (wavelength, reflectance0, reflectance1,...)
        combinedArray.push(obj);
    }

    return combinedArray;
}


//Implementation function of the graph
function MainChart_implementChart(isChangeSpectralLibrary, floatsArray, spectralFloatsArray) {

    // Store the data for spectral chart (if drawn a clicked chart then the spectralFloatsArray is null and vice versa)
    var spectralLibraryDataProviderChart = MainChart_handleSpectralChartValues(spectralFloatsArray);

    // Store the data for multiple clicked charts

    // get chart data values from clicked chart values (450 values)
    var spectralDataProviderChart = MainChart_handleClickedChartValues(floatsArray);

    // Check if it is update current line chart or add new chart
    if ($("#radioBtnAddChartMainChart").is(':checked')) {
        // Handle for add new clicked chart
        if (!isChangeSpectralLibrary) {
            dataProviderChartsArray.push(spectralDataProviderChart);
            console.log("Add new clicked line chart, count line charts: " + ( lineChartsCount + 1 ) );

            // add the clicked point to place markers array to draw a layer with all points
            var obj = new PlaceMarkerConstructor(clickedLatitude, clickedLongitude, CLICKED_ICON_PATH + (lineChartsCount + 1) + ".png");
            placeMarkersArray.push(obj);

            // a line chart is added
            MainChart_isAddedALineChart = true;
        } else {
            // Handle for add new spectral library
            spectralLibraryDataProviderChartsArray.push(spectralLibraryDataProviderChart);
            console.log("Add new spectral library line chart, count line charts: " + ( lineChartsCount + 1 ) );

            // a line chart is added
            MainChart_isAddedALineChart = true;
        }

    } else {
        // update the current line chart with new values
        // if this is the first line chart, then it is added not update
        if (dataProviderChartsArray.length === 0 && !isChangeSpectralLibrary) {
            dataProviderChartsArray.push(spectralDataProviderChart);
            console.log("Add the first clicked line chart");

            // a line chart is added
            MainChart_isAddedALineChart = true;

            // add the clicked point to place markers array to draw a layer with all points
            var obj = new PlaceMarkerConstructor(clickedLatitude, clickedLongitude, CLICKED_ICON_PATH + "1.png");
            placeMarkersArray.push(obj);
        } else if (spectralLibraryDataProviderChartsArray.length === 0 && isChangeSpectralLibrary) {
                // Handle for spectral library
                spectralLibraryDataProviderChartsArray.push(spectralLibraryDataProviderChart);
                console.log("Add the first spectral library chart");

                // a line chart is added
                MainChart_isAddedALineChart = true;
        } else {
            // Update the latest clicked chart
            if (!isChangeSpectralLibrary) {
                dataProviderChartsArray[dataProviderChartsArray.length - 1] = spectralDataProviderChart;
                console.log("Update current clicked line chart");
            } else {
                // spectral library chart is updated
                spectralLibraryDataProviderChartsArray[spectralLibraryDataProviderChartsArray.length - 1] = spectralLibraryDataProviderChart;
                console.log("Update current spectral library chart");
            }
        }
    }


    // Number of line charts always start at 1 (after user clicking on a point to show the main chart dock)
    lineChartsCount = dataProviderChartsArray.length + spectralLibraryDataProviderChartsArray.length;
    console.log("Number of line charts: " + lineChartsCount);

    // store the array for combining 2 line charts
    // It will need to combine data from spectral library with the clicked coordinate array by finding the most identical wavelength value
    // in spectralDataProviderChart and spectraDataProviderChart (it is best if it is identical, otherwise the top min value)
    var spectralDataProviderChartMatched = MainChart_approximateSpectralValues(spectralDataProviderChart);

    // After getting the matching values from all spectral library and 1 clicked value chart, it will combine all the clicked value chart to an array
    var combinedArray = MainChart_CombineDataProviders(spectralDataProviderChartMatched);

    console.log("Combined multiple spectral library charts and clicked value charts");
    console.log(combinedArray);

    // This is a combined values from point values and spectral values in range (1 - 4)
    // As spectral library has more values from 0 - 1 and 4 - 5 then it need to prepend and append these values to spectralDataProviderChartMatched
    // Use the wavelength from spectral library to concatinate
    if ( spectralLibraryDataProviderChartsArray.length > 0) {
        var prependArray = [];
        var appendArray = [];

        // Prepend (wavelength < 1) and append (wavelength > 4) from spectral library charts to the combinedArray which contains all sl_reflectances and reflectances
        // Iterate all the wavelength of spectral library charts (use the first one as origin)
        for (var i = 0; i < spectralLibraryDataProviderChartsArray[0].length; i++) {
            var objTmp = spectralLibraryDataProviderChartsArray[0][i];
            var wavelength = objTmp.wavelength;

            var obj = {};
            obj["wavelength"] = wavelength;

            // Iterate all the spectral library charts
            for (var j = 0; j < spectralLibraryDataProviderChartsArray.length; j++) {
                // get the object from spectral library chart at wavelength index
                var slObjTmp = spectralLibraryDataProviderChartsArray[j][i];

                // combine multiple spectral library charts > 4 can have undefined array indexes
                if (typeof slObjTmp != 'undefined') {
                    // Prepend values from spectral library
                    if (wavelength < 1) {
                        var reflectanceIndex = "sl_reflectance" + j;
                        // get the reflectance of the current wavelength from all spectral libraries
                        obj[reflectanceIndex] = slObjTmp.reflectance;
                    } else if (wavelength > 4) {
                        var reflectanceIndex = "sl_reflectance" + j;
                        // get the reflectance of the current wavelength from all spectral libraries
                        obj[reflectanceIndex] = slObjTmp.reflectance;
                    }
                }

                // Iterate all the clicked value charts (outside of range then, value is null)
                for (var k = 0; k < dataProviderChartsArray.length; k++) {
                    if (wavelength < 1 || wavelength > 4) {
                        var reflectanceIndex = "reflectance" + k;
                        obj[reflectanceIndex] = null;
                    }
                }
            }

            if (wavelength < 1) {
                prependArray.push(obj);
            } else if(wavelength > 4) {
                appendArray.push(obj);
            }
        }

        // Concatinate the prepend and append values to array
        combinedArray = prependArray.concat(combinedArray).concat(appendArray);
    }

    console.log("Combine all values from spectral library charts and clicked value charts, range 0 - 5");
    console.log(combinedArray);

    // this is a defaultCombinedArrayCharts for wavelength (1-4)
    defaultCombinedArrayCharts = combinedArray;

    // Draw 2 charts from clicked coordinate and product spectral library
    /*var chart = AmCharts.makeChart("#" + chartDivID, {
        "type": "xy",
        "theme": "light",
        "marginRight": 10,
        "marginLeft": 10,
        "backgroundColor": "#2F5597",
        "backgroundAlpha": 1,
        "autoMarginOffset": 20,
      //  "mouseWheelZoomEnabled": true,
        "dataProvider": spectraDataProviderChart,
        "fontSize": 14,
        "color": "#ffffff",
        "marginTop": 50,
        "valueAxes": [{
            "position": "bottom",
            "tickLength": 0,
            "title": "Wavelength (µm)"
        }, {
            "position": "left",
            "tickLength": 0,
            "title": "Reflectance"
        }],
        "graphs": [{
            "id": "g1",
            "bullet": "round",
            "maxBulletSize": 1,
            "lineAlpha": 1,
            "valueField": "value",
            "xField": "wavelength",
            "yField": "value",
            "balloonText": "<span style='font-size:14px; color: #2E2EFE'> Wavelength: [[wavelength]]<br><b> Reflectance: [[value]]</span></b>",
        }, {
            "id": "g2",
            "bullet": "diamond",
            "maxBulletSize": 1,
            "lineAlpha": 1,
            "valueField": "wavelength1",
            "xField": "wavelength1",
            "yField": "wavelength1",
            "balloonText": "<span style='font-size:14px; color: #CBA706'> Wavelength: [[wavelength1]]<br><b> Reflectance: [[wavelength1]]</span></b>",
        }],

        "chartCursor": {
        //    "pan": true,
            "valueLineEnabled": true,
            "valueLineBalloonEnabled": false,
            "cursorAlpha": 1,
            "cursorColor": "#258cbb",
            "limitToGraph": "g1",
            "valueLineAlpha": 0.2,
            "valueZoomable": true,
            "valueBalloonsEnabled": true,
            "categoryBalloonEnabled": true
        },
        "export": {
            "enabled": true,
            "fileName": "ps2_" + drawCoverageID + "_lat_" + drawLat + "_lon_" + drawLon
        }
    });

    // it needs to resize the chart and write it when it is hidden
    chart.invalidateSize();
    chart.write(chartDivID);*/

    filterRangeCharts();

}

// only draw values from range charts text box (default is wavelength from: 1-4)
function filterRangeCharts() {
    // before drawing chart, it will select only values inside the range text box
    var range = $("#txtRangeChartsMainChart").val();
    if (range.includes("-")) {
        var rangeArray = range.split("-");
        var min = rangeArray[0];
        var max = rangeArray[1];

        var selectedCombinedArray = [];

        for (var i = 0; i < defaultCombinedArrayCharts.length; i++) {
            var wavelength = parseFloat(defaultCombinedArrayCharts[i].wavelength);
            if (wavelength >= min && wavelength <= max) {
                selectedCombinedArray.push(defaultCombinedArrayCharts[i]);
            }
        }

        drawChart(selectedCombinedArray);
    } else {
        alert("The range of charts need to be in format: number-number, e.g: 1-4");
    }
}


function drawChart(combinedArray) {

    // create a array of line charts with spectral and multiple line charts
    var chartsArray = [];

    //alert("Line charts: " + lineChartsCount);

    // graphs from clicked value charts
    for (var i = 0; i < dataProviderChartsArray.length; i++) {
        var obj = {};
        obj["id"] = "g" + i;
        var reflectanceIndex = "reflectance" + i;
        var index = i + 1;

        // If not draw spectral library then index start from 1 in the balloon text.
        if(selectedProductValuesSpectralLibrary == null) {
            index = i;
        }

        obj["balloonText"] = "<span style='font-size:12px;'>" + index + ". Reflectance: [[" + reflectanceIndex + "]]" + "</span>";
        obj["dashLength"] = 0;
        obj["lineThickness"] = 2;
        obj["valueField"] = reflectanceIndex;
        obj["connect"] = false;
        obj["lineColor"] = chartColors[i];

        // the chart lines
        chartsArray.push(obj);
    }

    // graphs from spectral library charts
    for (var i = 0; i < spectralLibraryDataProviderChartsArray.length; i++) {
        var obj = {};
        obj["id"] = "g" + MAXIMUM_LINECHARTS + i;
        var reflectanceIndex = "sl_reflectance" + i;
        var index = i + 1;

        // If not draw spectral library then index start from 1 in the balloon text.
        if(selectedProductValuesSpectralLibrary == null) {
            index = i;
        }

        obj["balloonText"] = "<span style='font-size:12px; color:red;'>" + index + ". sl_Reflectance: [[" + reflectanceIndex + "]]" + "</span>";
        obj["dashLength"] = 0;
        obj["lineThickness"] = 2;
        obj["valueField"] = reflectanceIndex;
        obj["connect"] = false;
        obj["lineColor"] = spectralLibraryChartColors[i];

        // the chart lines
        chartsArray.push(obj);
    }

    console.log(chartsArray);

    var chartDivID = "mainChartDiv";

    var chart = AmCharts.makeChart("#" + chartDivID, {
            "type": "serial",
            "theme": "light",
            "marginRight": 10,
            "marginLeft": 10,
            "backgroundColor": "#2F5597",
            "backgroundAlpha": 1,
            "autoMarginOffset": 20,
            "mouseWheelZoomEnabled": true,
            "dataProvider": combinedArray,
            "fontSize": 14,
            "color": "#ffffff",
            "marginTop": 50,
            "valueAxes": [{
                "axisAlpha": 0,
                "guides": [{
                    "fillAlpha": 0.1,
                    "fillColor": "#888888",
                    "lineAlpha": 0,
                    "toValue": 16,
                    "value": 10
                }],
                "position": "left",
                "tickLength": 0,
                "title": "Reflectance"
            }],
            "categoryAxis": {
                "title": "Wavelength (µm)"
            },
            "graphs": chartsArray,
            "chartCursor": {
                "pan": true,
                "valueLineEnabled": true,
                "valueLineBalloonEnabled": false,
                "cursorAlpha": 1,
                "cursorColor": "#258cbb",
                "limitToGraph": "g1",
                "valueLineAlpha": 0.2,
                "valueZoomable": true,
                "valueBalloonsEnabled": true,
                "categoryBalloonEnabled": true
            },
                "categoryField": "wavelength",
                 "categoryAxis": {
                    //"parseDates": true,
                    "axisAlpha": 0,
                    "gridAlpha": 0.1,
                    "minorGridAlpha": 0.1,
                    "minorGridEnabled": true,
                    "title": "Wavelength (µm)"
            },
            "export": {
                "enabled": true,
                "fileName": "ps2_" + drawCoverageID + "_lat_" + drawLat + "_lon_" + drawLon
            }
        });

    // it needs to resize the chart and write it when it is hidden
    //chart.invalidateSize();
    chart.write(chartDivID);

    $(".plot-dock").css("background", "#2F5597");
}
