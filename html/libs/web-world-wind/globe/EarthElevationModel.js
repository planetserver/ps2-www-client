/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports EarthElevationModel
 * @version $Id: EarthElevationModel.js 2936 2015-03-27 22:04:59Z tgaskins $
 */
define([
        '../geom/Location',
        '../geom/Sector',
        '../globe/ElevationModel',
        '../util/WmsUrlBuilder'
    ],
    function (Location,
              Sector,
              ElevationModel,
              WmsUrlBuilder) {
        "use strict";

        /**
         * Constructs an Earth elevation model.
         * @alias EarthElevationModel
         * @constructor
         * @augments ElevationModel
         * @classdesc Provides elevations for Earth. Elevations are drawn from the NASA World Wind elevation service.
         */
        var EarthElevationModel = function () {
            ElevationModel.call(this,
                Sector.FULL_SPHERE, new Location(45, 45), 12, "image/bil", "tiles_test", 256, 256);

            this.displayName = "Earth Elevation Model";
            this.minElevation = -11000; // Depth of Marianas Trench, in meters
            this.maxElevation = 8850; // Height of Mt. Everest
            this.pixelIsPoint = false; // World Wind WMS elevation layers return pixel-as-area images

            /*this.urlBuilder = new WmsUrlBuilder("http://worldwind26.arc.nasa.gov/elev1",
                                "GEBCO,aster_v2,USGS-NED", "", "1.3.0");*/
            var testEndPoint = "http://access.planetserver.eu:8080/geoserver/WWW_DEM_10km_1file/wms";
            var layer = "WWW_DEM_10km_1file:tiles_test";
            this.urlBuilder = new WmsUrlBuilder(testEndPoint, layer, "", "1.1.0");
        };

        EarthElevationModel.prototype = Object.create(ElevationModel.prototype);

        return EarthElevationModel;
    });