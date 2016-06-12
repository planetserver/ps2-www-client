// This function will get the WCPS query value for all the bands of clicked coordinate
MainChart_valuesClickedCoordinateArray = null;

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
    var spectraDataProviderChart = [];


    // This is for the clicked coordinate from WCPS
    var xDist = 3.0 / floatsArray.length; // Value for setting the equidistance Band wavelength which should be between 1 and 4
    var xPrev = 1.0; // Value used for storing the Band wavelength of the previous Band
    var Ymin = Infinity,
        Ymax = -Infinity; // Values for getting the minimum and maximum out of the array
    
    // First line chart
    function SpectraDataConstructorLine1(bandIndex, bandValue) {
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

        var spectraObj = new SpectraDataConstructorLine1(parseFloat(xPrev).toFixed(3), relectance);
        spectraDataProviderChart.push(spectraObj);

        if (Ymin > floatsArray[i]) { // Getting the minimum of value to draw chart
            Ymin = floatsArray[i];
        } else if (Ymax < floatsArray[i]) { // Getting the maximum of value to draw chart
            Ymax = floatsArray[i];
        }

        // If point value is valid or not valid still need to calculate the X coordinate for it.
        xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
    }


    // This is for the spectral library of product from category
    // only when select product dropdown in spectral library spectralFloatsArray will have values to draw second line chart
    if(spectralFloatsArray != null) {
        var xDist = 3.0 / spectralFloatsArray.length; // Value for setting the equidistance Band wavelength which should be between 1 and 4
        var xPrev = 1.0; // Value used for storing the Band wavelength of the previous Band
        var Ymin = Infinity,
            Ymax = -Infinity; // Values for getting the minimum and maximum out of the array

        // Second line chart
        function SpectraDataConstructorLine2(bandIndex, bandValue) {
            this.bandIndex1 = bandIndex;
            this.value1 = bandValue;
        }

        for (var i = 0; i < spectralFloatsArray.length; i++) {
            // Only get points with valid value
            var relectance = 0;

            if (spectralFloatsArray[i] != 65535 && spectralFloatsArray[i] != 0) {
                relectance = spectralFloatsArray[i];
            } else {
                relectance = null;
            }

            var spectraObj = new SpectraDataConstructorLine2(parseFloat(xPrev).toFixed(3), relectance);
            spectraDataProviderChart.push(spectraObj);

            if (Ymin > spectralFloatsArray[i]) { // Getting the minimum of value to draw chart
                Ymin = spectralFloatsArray[i];
            } else if (Ymax < spectralFloatsArray[i]) { // Getting the maximum of value to draw chart
                Ymax = spectralFloatsArray[i];
            }

            // If point value is valid or not valid still need to calculate the X coordinate for it.
            xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
        }
    }

    console.log(spectraDataProviderChart);
    
    // Draw 2 charts from clicked coordinate and product spectral library 
    var chart = AmCharts.makeChart("#" + chartDivID, {
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
    chart.write(chartDivID);

    $(".plot-dock").css("background", "#2F5597");
}