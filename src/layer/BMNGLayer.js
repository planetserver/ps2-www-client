/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports BMNGLayer
 * @version $Id: BMNGLayer.js 3123 2015-05-28 22:19:28Z tgaskins $
 */
define([
        '../geom/Location',
        '../geom/Sector',
        '../layer/TiledImageLayer',
        '../util/WmsUrlBuilder'
    ],
    function (Location,
              Sector,
              TiledImageLayer,
              WmsUrlBuilder) {
        "use strict";

        /**
         * Constructs a Blue Marble image layer.
         * @alias BMNGLayer
         * @constructor
         * @augments TiledImageLayer
         * @classdesc Displays a Blue Marble image layer that spans the entire globe.
         * @param {String} layerName The name of the layer to display, in the form "BlueMarble-200401"
         * "BlueMarble-200402", ... "BlueMarble-200412". "BlueMarble-200405" is used if the argument is null
         * or undefined.
         */
        var BMNGLayer = function (layerName) {
          var wcpsImageLayer = new WorldWind.RenderableLayer();
            TiledImageLayer.call(this,
                Sector.FULL_SPHERE, new Location(45, 45), 5, "image/jpeg", layerName, 128, 128);

            this.displayName = "Moon WMS service";
            this.pickEnabled = false;
            if(layerName === "MOLA_color"){
              this.urlBuilder = new WmsUrlBuilder("http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map",
                layerName || "moon_wgs84", "", "1.3.0");
            } else{
              this.urlBuilder = new WmsUrlBuilder("http://access.planetserver.eu:8080/rasdaman/ows",
                layerName || "moon_wgs84", "", "1.3.0");
            }



        };

      //  var wcpsQuery = function(){
        //  var request;
        //  request = 'http://212.201.45.10:8080/rasdaman/ows?query=for c in (' DTM ') return encode(scale(c, { i(1:100), j(1:100) }))], "png","nodata=0")';
        //}


        BMNGLayer.prototype = Object.create(TiledImageLayer.prototype);

        return BMNGLayer;
    });
