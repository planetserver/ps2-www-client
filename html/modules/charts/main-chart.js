// This function will get the WCPS query value for all the bands of clicked coordinate
MainChart_valuesClickedCoordinateArray = null;

// find in arrayLineChart1 a wavelength which is as same as wavelengthValue or is the smaller one but approximate this value
function MainChart_getIdenticalValue(wavelength, arrayLineChart2) {
    var max = 0;
    var identicalValue = 0;
    var maxIndex = 0;
    for(var i = 0; i < arrayLineChart2.length; i++) {
        if(wavelength === arrayLineChart2[i].bandIndex) {
            identicalValue = arrayLineChart2[i].value;
            return identicalValue;
        } else if (max <= wavelength) {
            max = arrayLineChart2[i].bandIndex;
            maxIndex = i;
            if(max > wavelength) {
                break;
            }
        }
    }

    // It cannot find the identical wavelength of line chart 1 in line chart 2, then use the approximate value
    identicalValue = arrayLineChart2[maxIndex].value;
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
            MainChart_implementChart("mainChartDiv", MainChart_valuesClickedCoordinateArray, selectedProductValuesSpectralLibrary);
        }
    });
}


//Implementation function of the graph
function MainChart_implementChart(chartDivID, floatsArray, spectralFloatsArray) {

    // combine array values from clicked coordinate and spectral library
    var spectralDataProviderChart1 = [];

    // This is for the clicked coordinate from WCPS
    var xDist = 3.0 / floatsArray.length; // Value for setting the equidistance Band wavelength which should be between 1 and 4
    var xPrev = 1.0; // Value used for storing the Band wavelength of the previous Band
    var Ymin = Infinity,
        Ymax = -Infinity; // Values for getting the minimum and maximum out of the array
    
    // First line chart
    function SpectralDataConstructorLine1(bandIndex, bandValue) {
        this.bandIndex = bandIndex;
        this.value = bandValue;
    }

    for (var i = 0; i < floatsArray.length; i++) {
        // Only get points with valid value
        var relectance = 0;

        if (floatsArray[i] != 65535 && floatsArray[i] != 0) {
            relectance = floatsArray[i];
        } else {
            relectance = null;
        }

        var spectraObj = new SpectralDataConstructorLine1(parseFloat(xPrev).toFixed(3), relectance);
        spectralDataProviderChart1.push(spectraObj);

        if (Ymin > floatsArray[i]) { // Getting the minimum of value to draw chart
            Ymin = floatsArray[i];
        } else if (Ymax < floatsArray[i]) { // Getting the maximum of value to draw chart
            Ymax = floatsArray[i];
        }

        // If point value is valid or not valid still need to calculate the X coordinate for it.
        xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
    }


    // Store the data for the line 2
    var spectralDataProviderChart2 = [];

    // This is for the spectral library of product from category
    // only when select product dropdown in spectral library spectralFloatsArray will have values to draw second line chart
    if(spectralFloatsArray != null) {
        var xDist = 3.0 / spectralFloatsArray.length; // Value for setting the equidistance Band wavelength which should be between 1 and 4
        var xPrev = 1.0; // Value used for storing the Band wavelength of the previous Band
        var Ymin = Infinity,
            Ymax = -Infinity; // Values for getting the minimum and maximum out of the array

        // Second line chart
        function SpectralDataConstructorLine2(bandIndex, bandValue) {
            this.bandIndex = bandIndex;
            this.value = bandValue;
        }

        for (var i = 0; i < spectralFloatsArray.length; i++) {
            // Only get points with valid value
            var relectance = 0;

            if (spectralFloatsArray[i] != 65535 && spectralFloatsArray[i] != 0) {
                relectance = spectralFloatsArray[i];
            } else {
                relectance = null;
            }

            var spectraObj = new SpectralDataConstructorLine2(parseFloat(xPrev).toFixed(3), relectance);
            spectralDataProviderChart2.push(spectraObj);

            if (Ymin > spectralFloatsArray[i]) { // Getting the minimum of value to draw chart
                Ymin = spectralFloatsArray[i];
            } else if (Ymax < spectralFloatsArray[i]) { // Getting the maximum of value to draw chart
                Ymax = spectralFloatsArray[i];
            }

            // If point value is valid or not valid still need to calculate the X coordinate for it.
            xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
        }
    }

    // store the array for combining 2 line charts
    var spectralDataProviderChartCombined = [];
    // Combined line chart
    function SpectralDataConstructorLineCombined(bandIndex, bandValue1, bandValue2) {
        this.bandIndex = bandIndex;
        this.value1 = bandValue1;
        this.value2 = bandValue2;
    }

    // It will need to combine data from spectral library with the clicked coordinate array by finding the most identical wavelength value 
    // in spectralDataProviderChart1 and spectraDataProviderChart (it is best if it is identical, otherwise the top min value)


    for(var i = 0; i < spectralDataProviderChart1.length; i++) {
        var wavelength = spectralDataProviderChart1[i].bandIndex;
        var value1 = spectralDataProviderChart1[i].value;
        var value2 = null;

        if(spectralFloatsArray != null) {
            value2 = MainChart_getIdenticalValue(wavelength, spectralDataProviderChart2);
            console.log(value2);
        }

        var spectraObj = new SpectralDataConstructorLineCombined(wavelength, value1, value2);
        spectralDataProviderChartCombined.push(spectraObj);

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
            "xField": "bandIndex",
            "yField": "value",
            "balloonText": "<span style='font-size:14px; color: #2E2EFE'> Wavelength: [[bandIndex]]<br><b> Reflectance: [[value]]</span></b>",
        }, {
            "id": "g2",
            "bullet": "diamond",
            "maxBulletSize": 1,
            "lineAlpha": 1,
            "valueField": "value1",
            "xField": "bandIndex1",
            "yField": "value1",
            "balloonText": "<span style='font-size:14px; color: #CBA706'> Wavelength: [[bandIndex1]]<br><b> Reflectance: [[value1]]</span></b>",
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
                "balloonText": "<span style='font-size:14px; color: #0234FF'> Wavelength:[[bandIndex]]<br><b> Reflectance:[[value]]</span></b>",
              //  "bullet": "round",
          //  "bulletSize": 0,
                "dashLength": 0,
                "lineThickness": 2,
                "colorField": "color",
                "valueField": "value1",
                "connect": false,
            }, {
                "id": "g2",
                "balloonText": "<span style='font-size:14px; color: #ff0000'> Wavelength:[[bandIndex]]<br><b> Reflectance:[[value]]</span></b>",
              //  "bullet": "round",
          //  "bulletSize": 0,
                "dashLength": 0,
                "lineThickness": 2,
                "colorField": "color",
                "valueField": "value2",
                "connect": false,
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
                "categoryField": "bandIndex",
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