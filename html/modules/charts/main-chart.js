// This function will get the WCPS query value for all the bands of clicked coordinate
MainChart_valuesClickedCoordinateArray = null;


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

function MainChart_getQueryResponseAndSetChart(query) {
    $.ajax({
        type: "get",
        url: query,
        success: function(data) {
            var parsedFloats = [];
            MainChart_valuesClickedCoordinateArray = Chart_parseFloats(data);
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

// Object constructor for combine a spectral array and a clicked array
function SpectralDataConstructorLineCombined(wavelength, reflectance0, reflectance1) {
    this.wavelength = wavelength;
    this.reflectance0 = reflectance0;
    this.reflectance1 = reflectance1;
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

        var spectraObj = new SpectralDataConstructorLine(parseFloat(xPrev).toFixed(3), relectance);
        spectralDataProviderChart1.push(spectraObj);

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
            var spectraObj = new SpectralDataConstructorLine(parseFloat(wavelength).toFixed(3), relectance);
            spectralDataProviderChart0.push(spectraObj);
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

        var spectraObj = new SpectralDataConstructorLineCombined(wavelength, reflectance0, reflectance1);
        spectralDataProviderChartCombined.push(spectraObj);

    }

    return spectralDataProviderChartCombined;
}



$(function() {
    // clear all the drawn charts, not the spectral library chart
    $("#btnClearChartsMultipleCharts").click(function() {
        var ret = confirm("Do you want to remove all clicked drawn charts?");
        if(ret) {
            // remove all the clicked drawn charts
            isDrawnClickedChart = false;
        }
    });

});


//Implementation function of the graph
function MainChart_implementChart(floatsArray, spectralFloatsArray) {

    // Store the data for the line 0
    var spectralDataProviderChart0 = MainChart_handleSpectralChartValues(spectralFloatsArray);

    // get chart data values from clicked chart values
    var spectralDataProviderChart1 = MainChart_handleClickedChartValues(floatsArray);

    // store the array for combining 2 line charts    
    // It will need to combine data from spectral library with the clicked coordinate array by finding the most identical wavelength value 
    // in spectralDataProviderChart1 and spectraDataProviderChart (it is best if it is identical, otherwise the top min value)
    var spectralDataProviderChartCombined = MainChart_approximateSpectralValues(spectralDataProviderChart0, spectralDataProviderChart1);
    
    // This is a combined values from point values and spectral values in range (1 - 4)
    // As spectral library has more values from 0 - 1 and 4 - 5 then it need to prepend and append these values to spectralDataProviderChartCombined
    // Use the wavelength from spectral library to concatinate
    if(spectralFloatsArray != null) {
        var prependArray = [];
        var appendArray = [];

        for(var i = 0; i < spectralFloatsArray.length; i++) {
            var wavelength =  selectedWaveLengthSpectralLibrary[i];

            // reflectance from spectral library
            var relectance = spectralFloatsArray[i];

            if(wavelength < 1) {
                // Prepend values from spectral library
                var spectraObj = new SpectralDataConstructorLineCombined(wavelength, relectance, null);
                prependArray.push(spectraObj);
            } else if(wavelength > 4) {
                var spectraObj = new SpectralDataConstructorLineCombined(wavelength, relectance, null);
                appendArray.push(spectraObj);
            }
        }

        // Concatinate the prepend and append values to array
        spectralDataProviderChartCombined = prependArray.concat(spectralDataProviderChartCombined).concat(appendArray);
    }
    
    console.log(spectralDataProviderChartCombined);
    
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


    drawChart(spectralDataProviderChartCombined);
    
}


function drawChart(spectralDataProviderChartCombined) {

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
            "dataProvider": spectralDataProviderChartCombined,
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
            "graphs": [{
                "id": "g1",
                "balloonText": "<span style='font-size:14px; color: #0234FF'> Wavelength:[[wavelength]]<br><b> Reflectance:[[reflectance0]]</span></b>",
              //  "bullet": "round",
          //  "bulletSize": 0,
                "dashLength": 0,
                "lineThickness": 2,
                "colorField": "color",
                "valueField": "reflectance0",
                "connect": false,
                "lineColor": "yellow"
            }, {
                "id": "g2",
                "balloonText": "<span style='font-size:14px; color: #ff0000'> Wavelength:[[wavelength]]<br><b> Reflectance:[[reflectance1]]</span></b>",
              //  "bullet": "round",
          //  "bulletSize": 0,
                "dashLength": 0,
                "lineThickness": 2,
                "colorField": "color",
                "valueField": "reflectance1",
                "connect": false,
                "lineColor": "#93fe01"
            }],

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
    chart.invalidateSize();
    chart.write(chartDivID);

    $(".plot-dock").css("background", "#2F5597");
}