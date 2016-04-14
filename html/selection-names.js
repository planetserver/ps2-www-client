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

coverageNames = [
    "MOLA Colorshaded",
    "Viking Mosaic"
];

customWCPSQueries = [
    {
        name: "Example query",
        value: "for c in ( AvgLandTemp )\n  return encode(1, 'csv')"
    }
];
