var newMinBand1 = 0;
var newMaxBand1 = 255;
var newMinBand2 = 0;
var newMaxBand2 = 255;
var newMinBand3 = 0;
var newMaxBand3 = 255;

// check current coverageId with clicked coverageId
var currentCoverageId = "";
// check current wcps query with new change in stretched wcps query to reload the histogram chart
var currentWCPSQuery = "";

// the full URL to download a PNG image from Python memcached
var pngWCPSQueryURL = "";

// Load the min, max Bands, histogram for 3 bands from cached original stretching PNG image
var histogramData;

$(document).ready(function() {
      // slider for red, green, blue bands to recalculte the newMin, newMax
    $( "#sliderBand1Histogram" ).slider({
        range: true,
        min: 0,
        max: 255,
        values: [ 0, 255 ],
        slide: function( event, ui ) {
            $( "#band1ValueRange" ).html(ui.values[ 0 ] + " - " + ui.values[ 1 ]); 
            newMinBand1 = ui.values[ 0 ];
            newMaxBand1 = ui.values[ 1 ];                       
        }, change: function( event, ui ) {
            $( "#band1ValueRange" ).html(ui.values[ 0 ] + " - " + ui.values[ 1 ]); 
        }
    });

    $( "#sliderBand2Histogram" ).slider({
        range: true,
        min: 0,
        max: 255,
        values: [ 0, 255 ],
        slide: function( event, ui ) {
            $( "#band2ValueRange" ).html(ui.values[ 0 ] + " - " + ui.values[ 1 ]); 
            newMinBand2 = ui.values[ 0 ];
            newMaxBand2 = ui.values[ 1 ];                       
        }, change: function( event, ui ) {
            $( "#band2ValueRange" ).html(ui.values[ 0 ] + " - " + ui.values[ 1 ]); 
        }      
    });

    $( "#sliderBand3Histogram" ).slider({
        range: true,
        min: 0,
        max: 255,
        values: [ 0, 255 ],
        slide: function( event, ui ) {
            $( "#band3ValueRange" ).html(ui.values[ 0 ] + " - " + ui.values[ 1 ]); 
            newMinBand3 = ui.values[ 0 ];
            newMaxBand3 = ui.values[ 1 ];                       
        }, change: function( event, ui ) {
            $( "#band3ValueRange" ).html(ui.values[ 0 ] + " - " + ui.values[ 1 ]); 
        }       
    });

    // Download the original stretched PNG or new adjusted min, max for bands
    $("#btnDownloadPNGImageHistogramChart").on("click", function() {        
        if (pngWCPSQueryURL === "") {
            alert("Please click on a stretched image first!");
            return;
        }
        var req = new XMLHttpRequest();
        req.open("GET", pngWCPSQueryURL, true);
        req.responseType = "blob";

        req.onload = function (event) {
            var blob = req.response;
            console.log(blob.size);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "ps2_" + drawCoverageID + ".png";
            link.click();
        };

        req.send();
    });


    // Load the new min, max for 3 bands on current coverage
    $("#btnNewMinMaxBandsHistogramChart").on("click", function() {
        if (drawCoverageID == "") {
            alert("Please click on a stretched image to select a coverage first!");
            return;
        }

        // Clicked coverage is not valid
        if (!validateClickedCoverage()) {
            return false;
        }

        var newMinMaxBand1 = $(" #sliderBand1Histogram ").slider("option", "values");
        var newMinBand1 = newMinMaxBand1[0];
        var newMaxBand1 = newMinMaxBand1[1];

        var newMinMaxBand2 = $(" #sliderBand2Histogram ").slider("option", "values");
        var newMinBand2 = newMinMaxBand2[0];
        var newMaxBand2 = newMinMaxBand2[1];

        var newMinMaxBand3 = $(" #sliderBand3Histogram ").slider("option", "values");
        var newMinBand3 = newMinMaxBand3[0];
        var newMaxBand3 = newMinMaxBand3[1];

        // Python will stretch to these new min, max values
        var newMinMaxBands = newMinBand1 + ":" + newMaxBand1 + "_" + newMinBand2 + ":" + newMaxBand2 + "_" + newMinBand3 + ":" + newMaxBand3;
        // Clicked on button to load new min, max values from sliders without loading histogram but only load new PNG to surfaceImage

        var coverageObj = getCoverageById(drawCoverageID);
        var wcpsQuery = coverageObj.wcpsQuery;
        wcpsQuery += "&newMinMaxBands=" + newMinMaxBands;

        // Update the URI to download WCPS in PNG with new adjusted min, max bands
        pngWCPSQueryURL = wcpsQuery;

        // Just load the new image on the current footprint of coverage
        loadNewMinMaxBandsOnCurrentSurfaceImage(wcpsQuery);

        // also reload the histogram charts with new vertical bars positions
        var tmp = histogramData.substring(histogramData.indexOf("["));
        histogramData = newMinMaxBands + "_" + tmp;

        // Reload the histogram chart
        createHistogramChart();
    });

});

// Return the histogram of stretched image (original or with new min, max bands)
function getHistogramData(wcpsQuery) {
    var result = "";

     // load the histogram of stretched coverage from Python memcached
    $.ajax({
        type: "GET",
        dataType: "text",
        url: wcpsQuery,
        cache: false,
        async: false,
        success: function(data) {
            result = data;
        }
    });

    console.log(result);

    return result;
}

// Load new adjusted min, max from sliders on current surface image
// wcpsQuery=.....&newMinMaxBands=20:30_60:70_120_140
function loadNewMinMaxBandsOnCurrentSurfaceImage(wcpsQuery) {
    for (var i = 0; i < renderLayer.length; i++) {
        if (renderLayer[i]._displayName === drawCoverageID.toLowerCase()) {
            // Change the image source of surfaceImage
            renderLayer[i].renderables[0].imageSource = wcpsQuery;
            // Then reload the renderable layer which contains the surface image with new adjusted stretching PNG with new min, max bands
            renderLayer[i].refresh();

            return;
        }
    }
}

// Return the values between [ ] as a String
function extractValuesFromArray(arrayString) {
    var matches = arrayString.match(/\[(.*?)\]/);
    return matches[1];
}

// This function will get the WCPS query value for all the bands of clicked coordinate
function HistogramChart_getQueryResponseAndSetChart() {

    // Clicked coverage is not valid
    if (!validateClickedCoverage()) {
        return false;
    }

    var coverageObj = getCoverageById(drawCoverageID);
    var wcpsQuery = coverageObj.wcpsQuery;
    
    
    // This is original WCPS query for stretching cached in tiff
    pngWCPSQueryURL = wcpsQuery;    

    var isCreateHistogramChart = true;

    // Click on a stretched coverage then just load histogram only once
    // Or if WCPS query is updated with new RGB combinator, then also reload the histogram chart (but need to click in another point of stretched footprint)
    if (currentCoverageId != drawCoverageID || currentWCPSQuery != wcpsQuery) {
        // Not create the histogram chart yet
        currentCoverageId = drawCoverageID;
        currentWCPSQuery = wcpsQuery;
        
        wcpsQuery += "&histogram=true";

        // Only when clicked on a new stretched footprint then it will load the new histogram data and redraw the histogram chart
        histogramData = getHistogramData(wcpsQuery);

        // Create histogram chart
        createHistogramChart();
    }
}


// Only create chart histogram once when clicking one new stretched coverage
function createHistogramChart() {

    // e.g: 20:30_50:70_12:34_[....]_[....]_[....]
    var tmp = histogramData.split("_");

    var newMinBand1 = parseInt(tmp[0].split(":")[0]);
    var newMaxBand1 = parseInt(tmp[0].split(":")[1]);
    // Change slider values
    $( "#sliderBand1Histogram" ).slider( "option", "values", [ newMinBand1, newMaxBand1 ] );


    var newMinBand2 = parseInt(tmp[1].split(":")[0]);
    var newMaxBand2 = parseInt(tmp[1].split(":")[1]);
    // Change slider values
    $( "#sliderBand2Histogram" ).slider( "option", "values", [ newMinBand2, newMaxBand2 ] );

    var newMinBand3 = parseInt(tmp[2].split(":")[0]);
    var newMaxBand3 = parseInt(tmp[2].split(":")[1]);

    // Change slider values
    $( "#sliderBand3Histogram" ).slider( "option", "values", [ newMinBand3, newMaxBand3 ] );

    var band1Values = extractValuesFromArray(tmp[3]);
    var band1Array = band1Values.split(', ').map(Number);

    var band2Values = extractValuesFromArray(tmp[4]);
    var band2Array = band2Values.split(', ').map(Number);

    var band3Values = extractValuesFromArray(tmp[5]);
    var band3Array = band3Values.split(', ').map(Number);

    // Values of 0 and 255 are nonsense to display in chart
    band1Array[0] = null;
    band1Array[255] = null;

    band2Array[0] = null;
    band2Array[255] = null;

    band3Array[0] = null;
    band3Array[255] = null;


    // Value for the highest histogram index from all 3 bands    
    var maxHistogramIndex = 0;

    for (var i = 0; i < 256; i++) {
        // find the highest histogram index of 3 bands
        if (maxHistogramIndex < band1Array[i]) {
            maxHistogramIndex = band1Array[i];
        }
        if (maxHistogramIndex < band2Array[i]) {
            maxHistogramIndex = band2Array[i];
        }
        if (maxHistogramIndex < band3Array[i]) {
            maxHistogramIndex = band3Array[i];
        }
    }


    var chartDivID = "HistogramChartDiv";


    var combinedArray = [];

    for (var i = 0; i < 256; i++) {
        var obj = {};
        for (var j = 0; j < 3; j++) {            
            var histogramIndex = "histogram";                        
            if (j == 0) {
                obj[histogramIndex + "0"] = band1Array[i];                   
                if (i == newMinBand1 || i == newMaxBand1) {
                    obj[histogramIndex + "1"] = maxHistogramIndex;
                } else {
                    obj[histogramIndex + "1"] = null;
                }
            } else if (j == 1) {
                obj[histogramIndex + "2"] = band2Array[i];                         
                if (i == newMinBand2 || i == newMaxBand2) {
                    obj[histogramIndex + "3"] = maxHistogramIndex;
                } else {
                    obj[histogramIndex + "3"] = null;
                }
            } else if (j == 2) {
                obj[histogramIndex + "4"] = band3Array[i];                         
                if (i == newMinBand3 || i == newMaxBand3) {
                    obj[histogramIndex + "5"] = maxHistogramIndex;
                } else {
                    obj[histogramIndex + "5"] = null;
                }
            }
            
            obj["pixelValue"] = i;
        }
        combinedArray.push(obj);        
    }

    // after that, create 3 empty charts with each chart contains 2 vertical bars for new min and new max

    


    //alert("Line charts: " + lineChartsCount);

    // graphs from clicked value charts
    var rgbColors = ['#f90909', '#f90909', '#02e515', '#02e515', '#6ebcff', '#6ebcff'];
    // the configuration for all 3 line charts
    var chartsArray = [];
    for (var i = 0; i < 6; i++) {
        var obj = {};
        obj["id"] = "g" + i;
        var histogramIndex = "histogram" + i;       
        if (i % 2 == 0) {
            obj["balloonText"] = "<span style='font-size:12px;'>" + i + ". Histogram Index: [[" + histogramIndex + "]]" + "</span>";
        }        
        obj["dashLength"] = 0;
        obj["lineThickness"] = 2;
        obj["valueField"] = histogramIndex;                
        obj["connect"] = true;
        obj["lineColor"] = rgbColors[i];

        // draw vertical bars for min, max of RGB histogram chart
        if (i % 2 == 1) {
            obj["type"] = "column";
        }

        // the chart lines
        chartsArray.push(obj);
    }

    var chart = AmCharts.makeChart("#" + chartDivID, {
        "type": "serial",
        "theme": "light",
        "marginRight": 10,
        "marginLeft": 10,
        "columnWidth": 1,
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
            "title": "Histogram"
        }],
        "categoryAxis": {
            "title": "Histogram Index"
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
        "categoryField": "pixelValue",
        "categoryAxis": {
            //"parseDates": true,
            "axisAlpha": 0,
            "gridAlpha": 0.1,
            "minorGridAlpha": 0.1,
            "minorGridEnabled": true,
            "title": "Pixel Values (0 - 255)"
        },
        "export": {
            "enabled": true,
            "fileName": "ps2_" + drawCoverageID
        }
    });

    // it needs to resize the chart and write it when it is hidden
    //chart.invalidateSize();
    chart.write(chartDivID);

    $(".histogram-dock").css("background", "#2F5597");
}

// Check if clicked coverage is already stretched
function validateClickedCoverage() {
    var coverageObj = getCoverageById(drawCoverageID);
    if (coverageObj.wcpsQuery.indexOf(PNG) !== -1) {
        alert("This coverage is not stretched (i.e: 3 bands must come from 'WCPS Custome Queries') , please choose RGB combinator to stretch bands on this coverage first.");
        return false;        
    }

    return true;
}