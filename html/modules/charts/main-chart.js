// This function will get the WCPS query value for all the bands of clicked coordinate
MainChart_valuesClickedCoordinateArray = null;

// All the obj for line charts are stored (not for the spectral library)
// store the data provider for multiple charts
dataProviderChartsArray = [];

MAXIMUM_LINECHARTS = 10;

CLICKED_ICON_PATH = "html/images/icons/main-chart/";

// Number of line charts and spectral library
var lineChartsCount = 0;

var chartColors = ["#FAF306", "#7EF10A", "#9B59B6", "#5499C7", "#48C9B0", "#58D68D", "#F4D03F", "#DC7633", "#00FFFF", "#FF00FF", "#FF0000"];

// when select add a new chart, it will add to dataProviderChartsArray (but not add if it is spectral library, it will only update)
var isAddNewLineChart = true;

// store the clicked coordinates to add the place markers
placeMarkersArray = [];


// check if a line chart is drawn
MainChart_isAddedALineChart = false;


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

    $.ajax({
        type: "get",
        url: query,
        success: function(data) {
            var parsedFloats = [];
            MainChart_valuesClickedCoordinateArray = Chart_parseFloats(data);

            isAddNewLineChart = true;
            // only click on the footprint to get values from coordinate
            MainChart_implementChart(MainChart_valuesClickedCoordinateArray, selectedProductValuesSpectralLibrary);

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
    var spectralDataProviderChart1 = [];

    // This is for the clicked coordinate from WCPS
    var xDist = 3.0 / floatsArray.length; // Value for setting the equidistance Band wavelength which should be between 1 and 4
    var xPrev = 1.0; // Value used for storing the Band wavelength of the previous Band
    var Ymin = Infinity,
        Ymax = -Infinity; // Values for getting the minimum and maximum out of the array

    for (var i = 0; i < floatsArray.length; i++) {
        // Only get points with valid value
        var relectance = floatsArray[i];

        var spectralObj = new SpectralDataConstructorLine(parseFloat(xPrev).toFixed(3), relectance);
        spectralDataProviderChart1.push(spectralObj);

        if (Ymin > floatsArray[i]) { // Getting the minimum of value to draw chart
            Ymin = floatsArray[i];
        } else if (Ymax < floatsArray[i]) { // Getting the maximum of value to draw chart
            Ymax = floatsArray[i];
        }

        // If point value is valid or not valid still need to calculate the X coordinate for it.
        xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
    }

    return spectralDataProviderChart1;
}


// Create array of object from spectral data values
function MainChart_handleSpectralChartValues(spectralFloatsArray) {
    // Store the data for the line 0
    var spectralDataProviderChart0 = [];

    // This is for the spectral library of product from category
    // only when select product dropdown in spectral library spectralFloatsArray will have values to draw second line chart
    if(spectralFloatsArray != null) {

        for (var i = 0; i < spectralFloatsArray.length; i++) {
            // Only get points with valid value
            var relectance = spectralFloatsArray[i];

            // wavelength is selected wavelength from spectral library
            var wavelength = selectedWaveLengthSpectralLibrary[i];
            var spectralObj = new SpectralDataConstructorLine(parseFloat(wavelength).toFixed(3), relectance);
            spectralDataProviderChart0.push(spectralObj);
        }
    }

    return spectralDataProviderChart0;
}


// spectral floats array has values from 0 - 5, clicked chart values has values from 1 - 4
// then it need to calculate the reflectance values for spectral array as same as in clicked chart value in range (1 - 4)
function MainChart_approximateSpectralValues(spectralDataProviderChart0, spectralDataProviderChart1) {
     // store the array for combining 2 line charts
    var spectralDataProviderChartCombined = [];

    for(var i = 0; i < spectralDataProviderChart1.length; i++) {
        var wavelength = spectralDataProviderChart1[i].wavelength;
        var reflectance0 = null;
        var reflectance1 = spectralDataProviderChart1[i].reflectance;

        if(spectralDataProviderChart0.length > 0) {
            reflectance0 = MainChart_getIdenticalValue(wavelength, spectralDataProviderChart0);
            if(reflectance0 == null) {
                //alert("NULL");
                //return;
            }
            //console.log(reflectance0);
        }

        var spectralObj = new SpectralDataConstructorLine(wavelength, reflectance0);
        spectralDataProviderChartCombined.push(spectralObj);

    }

    return spectralDataProviderChartCombined;
}



$(function() {
    // clear all the drawn charts, not the spectral library chart
    $("#btnClearChartsMultipleCharts").click(function() {
        if(!MainChart_isAddedALineChart) {
            alert("Please click on a footprint to retrieve the spectra first!");
            return;
        }

        // If a line chart is drawn
        var ret = confirm("Do you want to remove all clicked spectra?");
        if(ret) {
            // remove the data provider array for chart
            dataProviderChartsArray = [];

            // remove all the clicked drawn charts
            MainChart_isAddedALineChart = false;

            // remove the place marker array
            placeMarkersArray = [];

            // remove the drawn line charts by remove all the data, expect the spectral line chart
            MainChart_valuesClickedCoordinateArray = null;
            var floatsArray = [];
            MainChart_implementChart(floatsArray, selectedProductValuesSpectralLibrary);

            // clear all the clicked points
            placemarkLayer.removeAllRenderables();
        }
    });

});


// Combined the calculated spectral data providers (wavelength 1 - 4) and multiple line charts to array
function MainChart_CombineDataProviders(spectralDataProviderChartCombined) {
    var combinedArrayTmp = [];
    // spectral data provider a[0]
    combinedArrayTmp.push(spectralDataProviderChartCombined);
    // line charts data providers array
    combinedArrayTmp = combinedArrayTmp.concat(dataProviderChartsArray);

    // array[0] = array of data provider spectral
    // array[1] = array of data provider line 1
    // ...

    var combinedArray = [];

    // creat an array of objects which has 1 wavelength and multiple reflectance indexes
    // array({wavelength, reflectance0, reflectance1}, {wavelength, reflectance0, reflectane1})
    // spectral library is always reflectance0

    // all arrays have same number of wavelength
    var numberOfWavelength = spectralDataProviderChartCombined.length;

    for(var i = 0; i < numberOfWavelength; i++) {
        var obj = {};

        try {
            var wavelength = combinedArrayTmp[0][i].wavelength;
            obj["wavelength"] = wavelength;
        } catch(err) {
            console.log("wavelengh index: " + i);
            return;
        }


        for(var j = 0 ; j < combinedArrayTmp.length; j++) {
            var reflectanceIndex = "reflectance" + j;
            try {
                obj[reflectanceIndex] = combinedArrayTmp[j][i].reflectance;
            } catch(err) {
                console.log("relectance index: " + j);
            }
        }

        // obj (wavelength, reflectance0, reflectance1,...)
        combinedArray.push(obj);
    }

    return combinedArray;
}


//Implementation function of the graph
function MainChart_implementChart(floatsArray, spectralFloatsArray) {

    // Store the data for the line 0 (spectral chart)
    var spectralDataProviderChart0 = MainChart_handleSpectralChartValues(spectralFloatsArray);

    // Store the data for multiple clicked charts

    // get chart data values from clicked chart values (450 values)
    var spectralDataProviderChart1 = MainChart_handleClickedChartValues(floatsArray);

    // Number of line charts always start at 1 (after user clicking on a point to show the main chart dock)
    var lineChartsCount = dataProviderChartsArray.length;

    // Check if it is update current line chart or add new chart
    if($("#radioBtnAddChartMainChart").is(':checked')) {
        // Add new line chart (not new spectral library chart)
        if(isAddNewLineChart) {
            dataProviderChartsArray.push(spectralDataProviderChart1);
            console.log("Add new line chart, count line charts: " + ( lineChartsCount + 1) );

            isAddNewLineChart = false;

            // add the clicked point to place markers array to draw a layer with all points
            var obj = new PlaceMarkerConstructor(clickedLatitude, clickedLongitude, CLICKED_ICON_PATH + (lineChartsCount + 1) + ".png");
            placeMarkersArray.push(obj);

            // a line chart is added
            MainChart_isAddedALineChart = true;
        }
    } else {
        // update the current line chart with new values
        // if this is the first line chart, then it is added not update
        if(lineChartsCount === 0) {
            dataProviderChartsArray.push(spectralDataProviderChart1);
            console.log("Add the first line chart");

            // a line chart is added
            MainChart_isAddedALineChart = true;

            // add the clicked point to place markers array to draw a layer with all points
            var obj = new PlaceMarkerConstructor(clickedLatitude, clickedLongitude, CLICKED_ICON_PATH + "1.png");
            placeMarkersArray.push(obj);
        } else {
            dataProviderChartsArray[lineChartsCount - 1] = spectralDataProviderChart1;
            console.log("Update current line chart");
        }
    }

    // store the array for combining 2 line charts
    // It will need to combine data from spectral library with the clicked coordinate array by finding the most identical wavelength value
    // in spectralDataProviderChart1 and spectraDataProviderChart (it is best if it is identical, otherwise the top min value)
    var spectralDataProviderChartCombined = MainChart_approximateSpectralValues(spectralDataProviderChart0, spectralDataProviderChart1);

    var combinedArray = MainChart_CombineDataProviders(spectralDataProviderChartCombined);

    // This is a combined values from point values and spectral values in range (1 - 4)
    // As spectral library has more values from 0 - 1 and 4 - 5 then it need to prepend and append these values to spectralDataProviderChartCombined
    // Use the wavelength from spectral library to concatinate
    if(spectralFloatsArray != null) {
        var prependArray = [];
        var appendArray = [];

        for(var i = 0; i < spectralFloatsArray.length; i++) {
            var wavelength =  selectedWaveLengthSpectralLibrary[i];

            // reflectance from spectral library
            var reflectance = spectralFloatsArray[i];

            // spectral + number of line charts
            lineChartsCount = dataProviderChartsArray.length + 1;

            if(wavelength < 1) {
                // Prepend values from spectral library
                var obj = {};
                obj["wavelength"] = wavelength;
                obj["reflectance0"] = reflectance;
                for(var j = 0; j < lineChartsCount; j++) {
                    var reflectanceIndex = "reflectance" + (j + 1);
                    obj[reflectanceIndex] = null;
                }
                prependArray.push(obj);
            } else if(wavelength > 4) {
                // append values to array
                var obj = {};
                obj["wavelength"] = wavelength;
                obj["reflectance0"] = reflectance;
                for(var j = 0; j < lineChartsCount; j++) {
                    var reflectanceIndex = "reflectance" + (j + 1);
                    obj[reflectanceIndex] = null;
                }
                appendArray.push(obj);
            } else {
                // only load the spectral library not load any line chart
                if(floatsArray.length === 0) {
                    var obj = {};
                    obj["wavelength"] = wavelength;
                    obj["reflectance0"] = reflectance;
                    for(var j = 0; j < lineChartsCount; j++) {
                        var reflectanceIndex = "reflectance" + (j + 1);
                        obj[reflectanceIndex] = null;
                    }

                    combinedArray.push(obj);
                }
            }
        }

        // Concatinate the prepend and append values to array
        combinedArray = prependArray.concat(combinedArray).concat(appendArray);
    }

    console.log(combinedArray);

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


    drawChart(combinedArray);

}


function drawChart(combinedArray) {

    // create a array of line charts with spectral and multiple line charts
    var chartsArray = [];

    // always has spectral line chart.
    lineChartsCount = dataProviderChartsArray.length + 1;

    //alert("Line charts: " + lineChartsCount);

    for(var i = 0; i < lineChartsCount; i++) {
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
