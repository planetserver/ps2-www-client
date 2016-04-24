/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports OneImageLayer
 * @version $Id: OneImageLayer.js 2942 2015-03-30 21:16:36Z tgaskins $
 */
define([
        '../layer/RenderableLayer',
        '../geom/Sector',
        '../shapes/SurfaceImage',
        '../util/WWUtil'
    ],
    function (RenderableLayer,
              Sector,
              SurfaceImage,
              WWUtil) {
        "use strict";

        /**
         * Constructs a Blue Marble image layer that spans the entire globe.
         * @alias OneImageLayer
         * @constructor
         * @augments RenderableLayer
         * @classdesc Displays a Blue Marble image layer that spans the entire globe with a single image.
         */
        var OneImageLayer = function (url, layerName) {
            RenderableLayer.call(this, layerName);

            var surfaceImage = new SurfaceImage(Sector.FULL_SPHERE, url);

            this.addRenderable(surfaceImage);

            this.pickEnabled = false;
            this.minActiveAltitude = 3e6;
        };

        OneImageLayer.prototype = Object.create(RenderableLayer.prototype);

        return OneImageLayer;
    });
