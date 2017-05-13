
// store the xAxis values from 1 - 4
xAxisArray = [];


// number of charts to draw for all the charts
MAXIMUM_SPECTRAL_LIBRARY_CHARTS = 5;
MAXIMUM_LINECHARTS = 10;

CLICKED_ICON_PATH = "html/images/icons/main-chart/";

// colors of clicked coorinate and spectral library
var spectralLibraryChartColors = ["#FAF508", "#7ED15A", "#9B89B8", "#54C9C9", "#48E9B2"];

// color of clicked coordinate chart
var chartColors = ["#7EF10A", "#9B59B6", "#5499C7", "#48C9B0", "#58D68D", "#F4D03F", "#DC7633", "#00FFFF", "#FF00FF", "#FF0000"];

$(document).ready(function() {
    // change here with "ps2EndPoint" later
    var csvFile = "";
    if (clientName === MARS_CLIENT) {
        csvFile = ps2EndPoint + "/html/data/x_axis.csv";
    } else {
        csvFile = ps2EndPoint + "/html/data/m3_x_axis.csv";
    }

    // load the x_axis for charts from file
    $.ajax({
            type: "GET",
            dataType: "text",
            url: csvFile,
            cache: false,
            async: true,
            success: function(data) {
                xAxisArray = data.split(",").map(Number);
            }
    });
});


// Object constructor for data line
function SpectralDataConstructorLine(wavelength, reflectance) {
    this.wavelength = wavelength;
    this.reflectance = reflectance;
}



// ---- Charts parse data to array
// Create array of object from spectral data values
function Chart_handleSpectralChartValues(spectralFloatsArray, selectedWaveLengthSpectralLibraryArrayRef) {
    // Store the data for the line 0
    var spectralLibraryDataProviderChart = [];

    // This is for the spectral library of product from category
    // only when select product dropdown in spectral library spectralFloatsArray will have values to draw second line chart
    if (spectralFloatsArray != null) {

        for (var i = 0; i < spectralFloatsArray.length; i++) {
            // Only get points with valid value
            var relectance = spectralFloatsArray[i];

            // wavelength is selected wavelength from spectral library
            var wavelength = selectedWaveLengthSpectralLibraryArrayRef[i];
            var spectralObj = new SpectralDataConstructorLine(parseFloat(wavelength).toFixed(5), relectance);
            spectralLibraryDataProviderChart.push(spectralObj);
        }
    }

    return spectralLibraryDataProviderChart;
}


// Create array of objects from clicked values from WCPS (Y axis) and x-axis from xAxisArray
function Chart_handleClickedChartValues(floatsArray) {
    // combine array values from clicked coordinate and spectral library
    var spectralDataProviderChart = [];

    for (var i = 0; i < floatsArray.length; i++) {
        // Only get points with valid value
        var relectance = floatsArray[i];

        var spectralObj = new SpectralDataConstructorLine(xAxisArray[i].toFixed(5), relectance);
        spectralDataProviderChart.push(spectralObj);
    }

    return spectralDataProviderChart;
}


// --- Main functions to handle the charts (process data, combine data then drawchart)
//Implementation function of the graph
function Chart_implementChart(isChangeSpectralLibrary, floatsArray, spectralFloatsArray, chartPostfix, selectedWaveLengthSpectralLibraryArrayRef, dataProviderChartsArrayRef, spectralLibrarydataProviderChartsArrayRef, defaultCombinedArrayChartsRef, dataProviderChartsArrayRef, selectedProductValuesSpectralLibraryRef, lineChartsCountRef, isAddedALineChartRef) {

    // Store the data for spectral chart (if drawn a clicked chart then the spectralFloatsArray is null and vice versa)
    var spectralLibraryDataProviderChart = Chart_handleSpectralChartValues(spectralFloatsArray, selectedWaveLengthSpectralLibraryArrayRef);

    // Store the data for multiple clicked charts

    // get chart data values from clicked chart values (438 values)
    var spectralDataProviderChart = Chart_handleClickedChartValues(floatsArray);
    var minWavelength = Math.min.apply(null, xAxisArray).toFixed(5);
    var maxWavelength = Math.max.apply(null, xAxisArray).toFixed(5);

    // Change the default of set range wavelength from min to max instead of (1-4)
    $("#txtRangeCharts" + chartPostfix).val(minWavelength + "-" + maxWavelength);

    // Check if it is update current line chart or add new chart
    if ($("#radioBtnAddChart" + chartPostfix).is(':checked')) {
        // Handle for add new clicked chart
        if (!isChangeSpectralLibrary) {
            // not allow to add a new clicked line chart with ratio chart
            if (chartPostfix === "RatioChart") {
                alert("You cannot add more band ratio chart, only allow to add more spectral library charts");
                return;
            }
            dataProviderChartsArrayRef.push(spectralDataProviderChart);
            console.log("Add new clicked line chart, count line charts: " + ( lineChartsCountRef.count + 1 ) );

            if (chartPostfix === "MainChart") {
                // add the clicked point to place markers array to draw a layer with all points
                var obj = new PlaceMarkerConstructor(clickedLatitude, clickedLongitude, CLICKED_ICON_PATH + (lineChartsCountRef.count + 1) + ".png");
                placeMarkersArray.push(obj);
            }

            // a line chart is added
            isAddedALineChartRef.isDrawn = true;
        } else {
            // Handle for add new spectral library
            spectralLibrarydataProviderChartsArrayRef.push(spectralLibraryDataProviderChart);
            console.log("Add new spectral library line chart, count line charts: " + ( lineChartsCountRef.count + 1 ) );

            // a line chart is added
            isAddedALineChartRef.isDrawn = true;
        }

    } else {
        // update the current line chart with new values
        // if this is the first line chart, then it is added not update
        if (dataProviderChartsArrayRef.length === 0 && !isChangeSpectralLibrary) {
            dataProviderChartsArrayRef.push(spectralDataProviderChart);
            console.log("Add the first clicked line chart");

            // a line chart is added
            isAddedALineChartRef.isDrawn = true;

            // add the clicked point to place markers array to draw a layer with all points
            if (chartPostfix === "MainChart") {
                var obj = new PlaceMarkerConstructor(clickedLatitude, clickedLongitude, CLICKED_ICON_PATH + "1.png");
                placeMarkersArray.push(obj);
            }
        } else if (spectralLibrarydataProviderChartsArrayRef.length === 0 && isChangeSpectralLibrary) {
                // Handle for spectral library
                spectralLibrarydataProviderChartsArrayRef.push(spectralLibraryDataProviderChart);
                console.log("Add the first spectral library chart");

                // a line chart is added
                isAddedALineChartRef.isDrawn = true;
        } else {
            // Update the latest clicked chart
            if (!isChangeSpectralLibrary) {
                dataProviderChartsArrayRef[dataProviderChartsArrayRef.length - 1] = spectralDataProviderChart;
                console.log("Update current clicked line chart");
            } else {
                // spectral library chart is updated
                spectralLibrarydataProviderChartsArrayRef[spectralLibrarydataProviderChartsArrayRef.length - 1] = spectralLibraryDataProviderChart;
                console.log("Update current spectral library chart");
            }
        }
    }


    // Number of line charts always start at 1 (after user clicking on a point to show the main chart dock)
    lineChartsCountRef.count = dataProviderChartsArrayRef.length + spectralLibrarydataProviderChartsArrayRef.length;
    console.log("Number of line charts: " + lineChartsCountRef.count);

    // store the array for combining 2 line charts
    // It will need to combine data from spectral library with the clicked coordinate array by finding the most identical wavelength value
    // in spectralDataProviderChart and spectraDataProviderChart (it is best if it is identical, otherwise the top min value)
    var spectralDataProviderChartMatched = Chart_approximateSpectralValues(spectralDataProviderChart, spectralLibrarydataProviderChartsArrayRef);

    // After getting the matching values from all spectral library and 1 clicked value chart, it will combine all the clicked value chart to an array
    var combinedArray = Chart_CombineDataProviders(spectralDataProviderChartMatched, dataProviderChartsArrayRef);

    console.log("Combined multiple spectral library charts and clicked value charts");
    console.log(combinedArray);

    // This is a combined values from point values and spectral values in range (1 - 4)
    // As spectral library has more values from 0 - 1 and 4 - 5 then it need to prepend and append these values to spectralDataProviderChartMatched
    // Use the wavelength from spectral library to concatinate
    if ( spectralLibrarydataProviderChartsArrayRef.length > 0) {
        var prependArray = [];
        var appendArray = [];

        // Prepend (wavelength < 1) and append (wavelength > 4) from spectral library charts to the combinedArray which contains all sl_reflectances and reflectances
        // Iterate all the wavelength of spectral library charts (use the first one as origin)
        for (var i = 0; i < spectralLibrarydataProviderChartsArrayRef[0].length; i++) {
            var objTmp = spectralLibrarydataProviderChartsArrayRef[0][i];
            var wavelength = objTmp.wavelength;

            var obj = {};
            obj["wavelength"] = wavelength;

            // Iterate all the spectral library charts
            for (var j = 0; j < spectralLibrarydataProviderChartsArrayRef.length; j++) {
                // get the object from spectral library chart at wavelength index
                var slObjTmp = spectralLibrarydataProviderChartsArrayRef[j][i];

                // combine multiple spectral library charts > 4 can have undefined array indexes
                if (typeof slObjTmp != 'undefined') {
                    // Prepend values from spectral library
                    if (wavelength < minWavelength) {
                        var reflectanceIndex = "sl_reflectance" + j;
                        // get the reflectance of the current wavelength from all spectral libraries
                        obj[reflectanceIndex] = slObjTmp.reflectance;
                    } else if (wavelength > maxWavelength) {
                        var reflectanceIndex = "sl_reflectance" + j;
                        // get the reflectance of the current wavelength from all spectral libraries
                        obj[reflectanceIndex] = slObjTmp.reflectance;
                    }
                }

                // Iterate all the clicked value charts (outside of range then, value is null)
                for (var k = 0; k < dataProviderChartsArrayRef.length; k++) {
                    if (wavelength < minWavelength || wavelength > maxWavelength) {
                        var reflectanceIndex = "reflectance" + k;
                        obj[reflectanceIndex] = null;
                    }
                }
            }

            if (wavelength < minWavelength) {
                prependArray.push(obj);
            } else if(wavelength > maxWavelength) {
                appendArray.push(obj);
            }
        }

        // Concatinate the prepend and append values to array
        combinedArray = prependArray.concat(combinedArray).concat(appendArray);
    }

    console.log("Combine all values from spectral library charts and clicked value charts, range 0 - 5");
    console.log(combinedArray);

    // this is a defaultCombinedArrayChartsRef for wavelength (1-4)
    // clear the old values before pushing new data
    defaultCombinedArrayChartsRef.length = 0;
    // need to shallow copy
    for (var i = 0; i < combinedArray.length; i++) {
        defaultCombinedArrayChartsRef.push(combinedArray[i]);
    }

    Chart_filterRangeCharts(chartPostfix, defaultCombinedArrayChartsRef, dataProviderChartsArrayRef, selectedProductValuesSpectralLibraryRef, spectralLibrarydataProviderChartsArrayRef);
}




// --- Charts process data
// find in arrayLineChart1 a wavelength which is as same as wavelengthValue or is the smaller one but approximate this value
function Chart_getIdenticalValue(wavelength, spectralObjArray) {
    var max = 0;
    var identicalValue = 0;
    var maxIndex = 0;
    for (var i = 0; i < spectralObjArray.length; i++) {
        if (wavelength === spectralObjArray[i].wavelength) {
            identicalValue = spectralObjArray[i].reflectance;
            return identicalValue;
        } else if (max <= wavelength) {
            max = spectralObjArray[i].wavelength;
            maxIndex = i;
            if (max > wavelength) {
                break;
            }
        }
    }

    // It cannot find the identical wavelength of line chart 1 in line chart 2, then use the approximate value
    identicalValue = spectralObjArray[maxIndex].reflectance;
    return identicalValue;
}


// it needs to match the wavelength from spectra library charts and 1 clicked value chart (i.e: they don't have same wavelength points and cannot draw charts if they are not matched)
function Chart_approximateSpectralValues(spectralDataProviderChart, spectralLibrarydataProviderChartsArrayRef) {
     // store the array for matching spectral library charts and 1 clciked value chart
    var spectralDataProviderChartMatched = [];

    try {
        for (var i = 0; i < spectralDataProviderChart.length; i++) {
            var wavelength = spectralDataProviderChart[i].wavelength;

            // create object to store the wavelength and reflectance from matched of all spectral library charts
            var obj = {};
            obj["wavelength"] = wavelength;

            // match all the added spectral library
            for (var j = 0; j < spectralLibrarydataProviderChartsArrayRef.length; j++) {
                var spectralLibraryDataProviderChart = spectralLibrarydataProviderChartsArrayRef[j];

                // get the reflectance from the identical wavelength of clicked value chart and all the spectral library charts
                var reflectance = Chart_getIdenticalValue(wavelength, spectralLibraryDataProviderChart);

                var reflectanceIndex = "sl_reflectance" + j;
                obj[reflectanceIndex] = reflectance;
            }

            spectralDataProviderChartMatched.push(obj);
        }
    } catch(err) {
        console.log("Error: " + err);
        console.log(spectralLibrarydataProviderChartsArrayRef);
        console.log(spectralDataProviderChart);
    }


    // This stores the matched wavelength between the spectral library charts and clicked charts (i.e: all has the same wavelength points in charts)
    // and the range is from 1 - 4
    return spectralDataProviderChartMatched;
}



// Combined the matched between spectral library charts and clicked value charts with wavelength from clicked value
// Then, it creates all the values from spectral library charts and clicked value charts to 1 array of objects to draw all the charts
function Chart_CombineDataProviders(spectralDataProviderChartMatched, dataProviderChartsArrayRef) {

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
            for (var j = 0; j < dataProviderChartsArrayRef.length; j++) {
                // clicked value chart
                var reflectanceIndex = "reflectance" + j;
                // reflectance from clicked value can be null
                obj[reflectanceIndex] = dataProviderChartsArrayRef[j][i].reflectance;
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


// --- Filter chart by range (1-4)
// only draw values from range charts text box (default is wavelength from: 1-4)
function Chart_filterRangeCharts(chartPostfix, defaultCombinedArrayChartsRef, dataProviderChartsArrayRef, selectedProductValuesSpectralLibraryRef, spectralLibrarydataProviderChartsArrayRef) {
    // before drawing chart, it will select only values inside the range text box
    var range = $("#txtRangeCharts" + chartPostfix).val();
    if (range.includes("-")) {
        var rangeArray = range.split("-");
        var min = rangeArray[0];
        var max = rangeArray[1];

        var selectedCombinedArray = [];

        for (var i = 0; i < defaultCombinedArrayChartsRef.length; i++) {
            var wavelength = parseFloat(defaultCombinedArrayChartsRef[i].wavelength);
            if (wavelength >= min && wavelength <= max) {
                selectedCombinedArray.push(defaultCombinedArrayChartsRef[i]);
            }
        }

        Chart_drawChart(selectedCombinedArray, chartPostfix + "Div", dataProviderChartsArrayRef, selectedProductValuesSpectralLibraryRef, spectralLibrarydataProviderChartsArrayRef);
    } else {
        alert("The range of charts need to be in format: number-number, e.g: 1-4");
    }
}


// --- Draw chart functions
function Chart_drawChart(combinedArray, chartDivID, dataProviderChartsArrayRef, selectedProductValuesSpectralLibraryRef, spectralLibrarydataProviderChartsArrayRef) {

    // create a array of line charts with spectral and multiple line charts
    var chartsArray = [];

    //alert("Line charts: " + lineChartsCount);

    // graphs from clicked value charts
    for (var i = 0; i < dataProviderChartsArrayRef.length; i++) {
        var obj = {};
        obj["id"] = "g" + i;
        var reflectanceIndex = "reflectance" + i;
        var index = i + 1;

        // If not draw spectral library then index start from 1 in the balloon text.
        if (selectedProductValuesSpectralLibraryRef == null) {
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
    for (var i = 0; i < spectralLibrarydataProviderChartsArrayRef.length; i++) {
        var obj = {};
        obj["id"] = "g" + MAXIMUM_LINECHARTS + i;
        var reflectanceIndex = "sl_reflectance" + i;
        var index = i + 1;

        // If not draw spectral library then index start from 1 in the balloon text.
        if (selectedProductValuesSpectralLibraryRef == null) {
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



// --- Utilities functions

// This function will get the WCPS query value for all the bands of clicked coordinate
function Chart_getQueryResponseAndSetChart(query) {
    if (currentOpenDock === "mainChartDock") {
	    MainChart_getQueryResponseAndSetChart(query);
    } else if (currentOpenDock === "bandRatioDock") {
	    RatioChart_getQueryResponseAndSetChart(query);
    }
}

// Parse float from string of float values in CSV("0.2323,0.3425,0.3535")
function Chart_parseFloatsWithComma(input) {
    var floatsArray = [];
    input = input.replace(/,/g, ' ');
    floatsArray = input.split(" ");

    // convert string value to float
    for (var i = 0; i < floatsArray.length; i++) {
    	floatsArray[i] = parseFloat(floatsArray[i]);
	if (floatsArray[i] === 65535 || floatsArray[i] < 0.00001) {
            floatsArray[i] = null;
        }
    }

    //console.log("after filter null values:");
    //console.log(floatsArray);
    return floatsArray;
}

// Parse float from string of float values in CSV ('{"0.2323 0.342 0.436"}') for spectral library reflectance values
function Chart_parseFloats(input) {
    var floatsArray = [];
    input = input.match(/"([^"]+)"/)[1];
    floatsArray = input.split(" ");

    // convert string value to float
    for (var i = 0; i < floatsArray.length; i++) {
	    floatsArray[i] = parseFloat(floatsArray[i]);
        if (floatsArray[i] === 65535 || floatsArray[i] < 0.00001) {
            floatsArray[i] = null;
        }
    }

    //console.log("after filter null values:");
    //console.log(floatsArray);
    return floatsArray;
}



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