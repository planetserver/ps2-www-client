
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
