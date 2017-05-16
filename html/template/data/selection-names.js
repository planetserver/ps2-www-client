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

layerNames = [
    "CRISM TRDR",
    "CRISM MRDR (Alpha Version)"
];

// check if URL contains "moon"
var url = window.location.href;

baseMapNames = null;

if (url.indexOf("moon") > -1) {
	baseMapNames = [
	   "Moon",
   	   "LOLA color"
	]; 
        layerNames = [ "Moon M3" ];
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
