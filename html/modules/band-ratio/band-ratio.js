var bandRatioNumeratorValues = [];
var bandRatioDenominatorValues = [];

$( document ).ready(function() {
	$(function() {
		BandRatio_getNotifyFraction();
	});
});

// notify about values for numerator, denominator
function BandRatio_getNotifyFraction() {
	var returnStr = "Please get values for: ";
	var isSelectedAll = true;
	if(bandRatioNumeratorValues.length === 0 ) {
		returnStr = returnStr + " -Numerator- ";
		isSelectedAll = false;
	}

	if(bandRatioDenominatorValues.length === 0 ) {
		returnStr = returnStr + " -Denominator- ";
		isSelectedAll = false;
	}

	// no notify if numerator and denomiator has values
	if(isSelectedAll) {
		returnStr = "Numerator and Denominator has values, draw chart for band-ratio of 2 clicked points.";
	} 

	$("#bandRatioNotification").text(returnStr);
}

// Set values of clicked point for Numerator or Denominator
function BandRatio_setFraction(arrayValues) {
	if( $("#bandRatioNumerator").is(":checked") ) {
		console.log("Set values for numerator.");
		bandRatioNumeratorValues = arrayValues;
	} else {
		bandRatioDenominatorValues = arrayValues;
		console.log("Set values for denominator");
	}
}


// Check if numerator and denominator all has the values, then can draw chart
function BandRatio_isSetAllValues() {
	if(bandRatioNumeratorValues.length !== 0 && bandRatioDenominatorValues.length !== 0) {
		return true;
	}
	return false;
}

