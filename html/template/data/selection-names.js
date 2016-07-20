projectionNames = [
    "3D",
    "Equirectangular",
    "Mercator",
    "North Polar",
    "South Polar",
    "North UPS",
    "South UPS",
    "North Gnomonic",
    "South Gnomonic"
];


// check if URL contains "moon"
var url = window.location.href;

baseMapNames = null;

if (url.includes("moon")) {
	baseMapNames = [
	   "Moon",
   	   "LOLA color"
	];
} else {
	baseMapNames = [
	   "Viking Mosaic",
	    "MOLA Colored"
	];
}


customWCPSQueries = [
    {
        name: "Example query",
        value: "for c in ( AvgLandTemp )\n  return encode(1, 'csv')"
    }
];
