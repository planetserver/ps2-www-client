
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

// $.ajax({
//   url: "https://github.com/planetserver/ps2-documentation/blob/master/about.md",
//   context: document.body,
//   success: function(mdText){
//     //where text will be the text returned by the ajax call
//     var converter = new showdown.Converter();
//     var htmlText = converter.makeHtml(mdText);
//     $("#collapse1").append(htmlText); //append this to a div with class outputDiv
//   }
// });

// function createCORSRequest(method, url) {
//   var xhr = new XMLHttpRequest();
//   if ("withCredentials" in xhr) {

//     // Check if the XMLHttpRequest object has a "withCredentials" property.
//     // "withCredentials" only exists on XMLHTTPRequest2 objects.
//     xhr.open(method, url, true);

//   } else if (typeof XDomainRequest != "undefined") {

//     // Otherwise, check if XDomainRequest.
//     // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
//     xhr = new XDomainRequest();
//     xhr.open(method, url);

//   } else {

//     // Otherwise, CORS is not supported by the browser.
//     xhr = null;

//   }
//   return xhr;
// }

// var xhr = createCORSRequest('GET', url);
// if (!xhr) {
//   throw new Error('CORS not supported');
// }

// var url = 'https://github.com/planetserver/ps2-documentation/blob/master/about.md';
// var xhr = createCORSRequest('GET', url);
// xhr.send();