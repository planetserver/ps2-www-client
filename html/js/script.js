
	/*left menu opening function*/
$(document).ready(function () {
	$('#menu-toggle').click(function() {
		if($('#menu').hasClass('open')) {
			$('#menu').removeClass('open');
			$('#menu-toggle').removeClass('open');
		}
		else {
			$('#menu').addClass('open');
			$('#menu-toggle').addClass('open');
		}
	});
});

	/*right menu opening function*/
$(document).ready(function () {
	$('#right-menu-toggle').click(function() {
		if($('#right-menu').hasClass('open')) {
			$('#right-menu').removeClass('open');
			$('#right-menu-toggle').removeClass('open');
		}
		else {
			$('#right-menu').addClass('open');
			$('#right-menu-toggle').addClass('open');
		}
	});
});

	/*right menu opening function*/
$(document).ready(function () {
	$('#right-layer-menu-toggle').click(function() {
		if($('#right-layer-menu').hasClass('open')) {
			$('#right-layer-menu').removeClass('open');
			$('#right-layer-menu-toggle').removeClass('open');
		}
		// else {
		// 	$('#right-layer-menu').addClass('open');
		// 	$('#right-layer-menu-toggle').addClass('open');
		// }
	});
});



// fetching information from github documentation and filling the about menu
var xhttpReq1 = new XMLHttpRequest();
xhttpReq1.open("GET", "https://raw.githubusercontent.com/planetserver/ps2-documentation/master/about.md", true);
xhttpReq1.send();
xhttpReq1.onreadystatechange = function() {
  if (xhttpReq1.readyState == 4 && xhttpReq1.status == 200) {
    document.getElementById("collapse1").innerHTML = xhttpReq1.responseText;
  }
};


//Implementation function of the graph
var implementChart = function(valuesArray) {

	var chart = c3.generate({
		bindto: "#right-layer-menu",
	size: {
	        height: 500,
	        width: 300
    	},

	zoom: {
        enabled: true
   	 },

	    data: {
	      columns: [
	        valuesArray
	      ]
	    }
	});
}

// function for loading the graph library //d3js.org/d3.v3.min.js located in the index.html
function loadScriptAndCall(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

var queryURL = "http://212.201.45.10:8080/rasdaman/ows?query=for%20c%20in%20(crism_test)%20return%20encode(c[%20N(120000:120000),%20E(20:20)%20],%20%22csv%22)#"
var serverResponse = " ";

function parseFloats(input) {
	var floatsArray = [];
	var helpString = input;

	var parsedFloat = parseFloat(helpString.slice(2, helpString.indexOf(" ")));

	while(helpString.indexOf(" ") != -1) {
		if(parsedFloat != 65535){
			floatsArray.push(parsedFloat);
		}
		helpString = helpString.slice(helpString.indexOf(" ") + 1, helpString.length);
		var parsedFloat = parseFloat(helpString.slice(0, helpString.indexOf(" ")));
	}
	return floatsArray;
}

function getQueryResponseAndSetChart(query) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", query, true);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
            	serverResponse = rawFile.responseText;
				var parsedFloats = [];
				parsedFloats = parseFloats(serverResponse);
				loadScriptAndCall("//d3js.org/d3.v3.min.js", implementChart(parsedFloats));
            }
        }
    }

    rawFile.send(null);
}

getQueryResponseAndSetChart(queryURL);

// var xhttpReq2 = new XMLHttpRequest();
// xhttpReq2.open("GET", "/footprints/vol1/footprintsTest.xml", true);
// xhttpReq2.send();
// xhttpReq2.onreadystatechange = function() {
// 	if (xhttpReq2.readyState == 4 && xhttpReq2.status == 200) {
//     console.log(xhttpReq2.responseXML);
//     var xmlDoc = xhttpReq2.responseXML;
//     //console.log("the XML doc is: " + xmlDoc);
//     //string from the XML value Footprint_C0_geometry
//     //var crdStr = xmlDoc.getElementsByTagName("Footprint_C0_geometry")[0].childNodes[0].nodeValue;

//     // work over the string
//     // console.log(crdStr.slice(10, crdStr.length));

//     // console.log(crdStr.indexOf(" "));


//     var jsonText = JSON.stringify(xmlToJson(xmlDoc));
//     console.log(jsonText);
// 	}
// }

// function parseStringToFloats(input) {
// 	var end = 0;
// 	// empty string evaluates to false
// 	while( end < input.length)  {
// 	    end = input.indexOf(" ", start );
// 	    // -1 => only one element in input || end of the string has been reached
// 	    if( end === -1 ) { end = input.length }
// 	    num =  parseFloat( input.substring( start, end ) );
// 	    // Should extracted string fail to parse then skip
// 	    if( num ) result.push( num );
// 	    // move forward or end will match current empty space
// 	    start = end + 1;
// 	}
// }
