/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @version $Id: landing.js 3120 2015-05-28 02:32:45Z tgaskins $
 */

requirejs(['../src/WorldWind',
        './LayerManager',
        './CoordinateController'], //ADD WMS LAYER
    function (ww,
              LayerManager,
              CoordinateController) {
        "use strict";

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        var wwd = new WorldWind.WorldWindow("canvasOne");

        var layers = [
        {layer: new WorldWind.BMNGOneImageLayer("../../images/moon.jpg", "Moon Image"), enabled: true},
        {layer: new WorldWind.BMNGLayer("DTM"), enabled: false}//THATS THE WMS CONSTRUCTOR //CHANGE name

        //{layer: new WorldWind.BMNGOneImageLayer("../../images/moon.jpg", "Moon Image"), enabled: true}
        // {layer: new WorldWind.ViewConrolsLayer(wwd), enabled: true}
        ];



        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }




        wwd.redraw();



        // Create a layer manager for controlling layer visibility.
        var layerManager = new LayerManager(wwd);


        // Create a coordinate controller to update the coordinate overlay elements.
        var coordinateController = new CoordinateController(wwd);
    });
