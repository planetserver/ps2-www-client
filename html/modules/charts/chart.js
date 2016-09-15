
// store the xAxis values from 1 - 4
xAxisArray = [];


$(document).ready(function() {
    // change here with "ps2EndPoint" later
    var csvFile = ps2EndPoint + "/html/data/x_axis.csv"
    // load the x_axis for charts from file
    $.ajax({
            type: "GET",
            dataType: "text",
            url: csvFile,
            cache: false,
            async: true,
            success: function(data) {
                xAxisArray = data.split(",");
            }
    });
});


// Object constructor for data line
function SpectralDataConstructorLine(wavelength, reflectance) {
    this.wavelength = wavelength;
    this.reflectance = reflectance;
}



// Create array of object from spectral data values
function Chart_handleSpectralChartValues(spectralFloatsArray) {
    // Store the data for the line 0
    var spectralLibraryDataProviderChart = [];

    // This is for the spectral library of product from category
    // only when select product dropdown in spectral library spectralFloatsArray will have values to draw second line chart
    if (spectralFloatsArray != null) {

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


// Create array of objects from clicked values from WCPS (Y axis) and x-axis from xAxisArray
function Chart_handleClickedChartValues(floatsArray) {
    // combine array values from clicked coordinate and spectral library
    var spectralDataProviderChart = [];

    for (var i = 0; i < floatsArray.length; i++) {
        // Only get points with valid value
        var relectance = floatsArray[i];

        var spectralObj = new SpectralDataConstructorLine(xAxisArray[i], relectance);
        spectralDataProviderChart.push(spectralObj);
    }

    return spectralDataProviderChart;
}

// This function will get the WCPS query value for all the bands of clicked coordinate
function Chart_getQueryResponseAndSetChart(query) {
    if(currentOpenDock === "mainChartDock") {
	    MainChart_getQueryResponseAndSetChart(query);
    } else if(currentOpenDock === "bandRatioDock") {
	    RatioChart_getQueryResponseAndSetChart(query);
    }
}

// Parse float from string of float values in CSV("0.2323,0.3425,0.3535")
function Chart_parseFloatsWithComma(input) {
    var floatsArray = [];
    input = input.replace(/,/g, ' ');
    floatsArray = input.split(" ");

    // convert string value to float
    for(var i = 0; i < floatsArray.length; i++) {
    	floatsArray[i] = parseFloat(floatsArray[i]);
	if (floatsArray[i] === 65535 || floatsArray[i] < 0.00001) {
            floatsArray[i] = null;
        }
    }

    //console.log("after filter null values:");
    //console.log(floatsArray);
    return floatsArray;
}

// Parse float from string of float values in CSV ('{"0.2323 0.342 0.436"}')
function Chart_parseFloats(input) {
    var floatsArray = [];
    input = input.match(/"([^"]+)"/)[1];
    floatsArray = input.split(" ");

    // convert string value to float
    for(var i = 0; i < floatsArray.length; i++) {
	floatsArray[i] = parseFloat(floatsArray[i]);
        if (floatsArray[i] === 65535 || floatsArray[i] < 0.00001) {
            floatsArray[i] = null;
        }
    }

    //console.log("after filter null values:");
    //console.log(floatsArray);
    return floatsArray;
}
