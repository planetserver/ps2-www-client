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
