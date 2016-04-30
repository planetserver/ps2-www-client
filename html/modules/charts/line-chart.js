// This function will get the WCPS query value for all the bands of clicked coordinate
function getQueryResponseAndSetChart(query) {
    $.ajax({
    	type: "get",
    	url: query,
    	success: function(data) {
                var parsedFloats = [];
                parsedFloats = parseFloats(data);
                implementChart(parsedFloats);
            }        
    });
}


//Implementation function of the graph
function implementChart(floatsArray) {

        var xDist = 3.0 / floatsArray.length; // Value for setting the equidistance Band wavelength which should be between 1 and 4
        var xPrev = 1.0; // Value used for storing the Band wavelength of the previous Band
        var Ymin = Infinity,
            Ymax = -Infinity; // Values for getting the minimum and maximum out of the array

        var spectraDataProviderChart = [];


        function SpectraDataConstructor(bandIndex, bandValue) {
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

            var spectraObj = new SpectraDataConstructor(parseFloat(xPrev).toFixed(3), relectance);
            spectraDataProviderChart.push(spectraObj);

            if (Ymin > floatsArray[i]) { // Getting the minimum of value to draw chart
                Ymin = floatsArray[i];
            } else if (Ymax < floatsArray[i]) { // Getting the maximum of value to draw chart
                Ymax = floatsArray[i];
            }

            // If point value is valid or not valid still need to calculate the X coordinate for it.
            xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
        }
     
       // Only add chart div when it does not exist

       if(!$("#chartdiv").length) {
       	    $("#mCSB_3_container").append("<div class='chartdiv' id='chartdiv' style='width:100%; height:560px;'></div>");
       }
       var chart = AmCharts.makeChart(".chartdiv", {
            "type": "serial",
            "theme": "light",
            "marginRight": 10,
	    "marginLeft": 10,
            "backgroundColor": "#2F5597",
	    "backgroundAlpha": 1,
            "autoMarginOffset": 20,
            "mouseWheelZoomEnabled": true,
            "dataProvider": spectraDataProviderChart,
	    "fontSize": 14,
	    "color": "#F6FF00",
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
                "balloonText": "<span style='font-size:14px; color: #ff0000'> Wave Length:[[bandIndex]]<br><b> Reflectance:[[value]]</span></b>",
              //  "bullet": "round",
	      //  "bulletSize": 0,
                "dashLength": 0,
		"lineThickness": 2,
                "colorField": "color",
                "valueField": "value",
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
                "title": "Wavelength"
            },
            "export": {
                "enabled": true,
		"fileName": "ps2_" + drawCoverageID
            }
        });

	// it needs to resize the chart and write it when it is hidden	
      	chart.invalidateSize();
	chart.write('chartdiv');

	$(".plot-dock").css("background", "#2F5597");
}

// Parse float from string of float values in CSV ('{"0.2323 0.342 0.436"}')
function parseFloats(input) {
    var floatsArray = [];
    input = input.match(/"([^"]+)"/)[1];
    floatsArray = input.split(" ");

    // convert string value to float
    for(var i = 0; i < floatsArray.length; i++) {
	floatsArray[i] = parseFloat(floatsArray[i]);
    }
 
    //console.log("after filter null values:");
    //console.log(floatsArray);
    return floatsArray;
}
