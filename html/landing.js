/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @version $Id: landing.js 3120 2015-05-28 02:32:45Z tgaskins $
 */

requirejs(['../src/WorldWind',
        './LayerManager',
        './CoordinateController',//ADD WMS LAYER
        '../src/gesture/TapRecognizer',
        ],
    function (ww,
              LayerManager,
              CoordinateController,
              TapRecognizer) {
        "use strict";

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        var wwd = new WorldWind.WorldWindow("canvasOne");

        var layers = [
        {layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: true},
        {layer: new WorldWind.BMNGOneImageLayer("images/mars.jpg", "Mars Image"), enabled: false},
        {layer: new WorldWind.BMNGOneImageLayer("images/earth.jpg", "Earth Image"), enabled: false}
        //{layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: true}//THATS THE WMS CONSTRUCTOR //CHANGE name

        //{layer: new WorldWind.BMNGOneImageLayer("../../images/moon.jpg", "Moon Image"), enabled: true}
        // {layer: new WorldWind.ViewConrolsLayer(wwd), enabled: true}
        ];

        for (var l = 0; l < layers.length; l++) {
            //console.log("layers[l].layer.enabled: " + layers[l].layer.enabled);
            //console.log("layers[l].enabled: " + layers[l].enabled);
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }

        // Create a layer to hold the surface shapes.
        var shapesLayer = new WorldWind.RenderableLayer("hrs00006fea_07_if173s_trr3_CAT_phot_p.img.tif");
        wwd.addLayer(shapesLayer);

        // Create a simple surface polygon, a triangle.
        var boundary = [];
        //boundary.push(new WorldWind.Location(-87.84786, 72.86521));
        //boundary.push(new WorldWind.Location(-87.84738, 76.57143));
        //boundary.push(new WorldWind.Location(-88.04004, 76.77301));
        //boundary.push(new WorldWind.Location(-88.04056, 72.70216));

        boundary.push(new WorldWind.Location(	-87.858	,	76.571));
        boundary.push(new WorldWind.Location(	-87.904	,	76.41	));
        boundary.push(new WorldWind.Location(	-87.949	,	76.24	));
        boundary.push(new WorldWind.Location(	-87.995	,	76.062));
        boundary.push(new WorldWind.Location(	-88.041	,	75.877));
        boundary.push(new WorldWind.Location(	-88.033	,	75.009));
        boundary.push(new WorldWind.Location(	-88.027	,	74.259));
        boundary.push(new WorldWind.Location(	-88.024	,	73.558));
        boundary.push(new WorldWind.Location(	-88.022	,	72.745));
        boundary.push(new WorldWind.Location(	-87.979	,	72.856));
        boundary.push(new WorldWind.Location(	-87.935	,	72.963));
        boundary.push(new WorldWind.Location(	-87.891	,	73.066));
        boundary.push(new WorldWind.Location(	-87.848	,	73.163));
        boundary.push(new WorldWind.Location(	-87.856	,	74.033));
        boundary.push(new WorldWind.Location(	-87.859	,	74.82	));
        boundary.push(new WorldWind.Location(	-87.86	,	75.668));

        // Create and set attributes for it. The shapes below except the surface polyline use this same attributes
        // object. Real apps typically create new attributes objects for each shape unless they know the attributes
        // can be shared among shapes.
        var attributes = new WorldWind.ShapeAttributes(null);
        attributes.outlineColor = WorldWind.Color.RED;
        attributes.interiorColor = new WorldWind.Color(1, 0.6, 0.6, 0);

        var highlightAttributes = new WorldWind.ShapeAttributes(attributes);
        highlightAttributes.interiorColor = new WorldWind.Color(1, 0.6, 0.6, 0);

        var shape = new WorldWind.SurfacePolygon(boundary, attributes);
        //shape.highlightAttributes = highlightAttributes;
        shapesLayer.addRenderable(shape);

        var layerRegognizer = function (o) {
            // X and Y coordinates of a single click
            var x = o.clientX,
                y = o.clientY;

            var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

            console.log(pickList);

            for (var p = 0; p < pickList.objects.length; p++) {
                // console.log("pickList.objects[p]: " + pickList.objects[p]);
                // console.log("pickList.objects[p].userObject: " + pickList.objects[p].userObject);

                if(pickList.objects[p].userObject === shape) {
                    console.log("The Layer Clicked: " + pickList.objects[p].userObject);
                    $('#right-layer-menu').addClass('open');
                    $('#right-layer-menu-toggle').addClass('open');


                }
            }
        };

        // Listen for Mouse clicks and regognize layers
        wwd.addEventListener("click", layerRegognizer);


        wwd.redraw();



        document.getElementById("Mars").onclick = function() {
            var layers = [
              {layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: false},
              {layer: new WorldWind.BMNGOneImageLayer("images/mars.jpg", "Mars Image"), enabled: true},
              {layer: new WorldWind.BMNGOneImageLayer("images/earth.jpg", "Earth Image"), enabled: false}
                //{layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: true}//THATS THE WMS CONSTRUCTOR //CHANGE name

                //{layer: new WorldWind.BMNGOneImageLayer("../../images/moon.jpg", "Moon Image"), enabled: true}
                // {layer: new WorldWind.ViewConrolsLayer(wwd), enabled: true}
            ];

            for (var l = 0; l < layers.length; l++) {
                layers[l].layer.enabled = layers[l].enabled;
                wwd.addLayer(layers[l].layer);
            }

            wwd.redraw();
        }

        document.getElementById("Earth").onclick = function() {
            var layers = [
              {layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: false},
              {layer: new WorldWind.BMNGOneImageLayer("images/mars.jpg", "Mars Image"), enabled: false},
              {layer: new WorldWind.BMNGOneImageLayer("images/earth.jpg", "Earth Image"), enabled: true}
                //{layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: true}//THATS THE WMS CONSTRUCTOR //CHANGE name

                //{layer: new WorldWind.BMNGOneImageLayer("../../images/moon.jpg", "Moon Image"), enabled: true}
                // {layer: new WorldWind.ViewConrolsLayer(wwd), enabled: true}
            ];

            for (var l = 0; l < layers.length; l++) {
                layers[l].layer.enabled = layers[l].enabled;
                wwd.addLayer(layers[l].layer);
            }

            wwd.redraw();
        }

        document.getElementById("Moon").onclick = function() {
            var layers = [
              {layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: true},
              {layer: new WorldWind.BMNGOneImageLayer("images/mars.jpg", "Mars Image"), enabled: false},
              {layer: new WorldWind.BMNGOneImageLayer("images/earth.jpg", "Earth Image"), enabled: false}
              //  {layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: true}//THATS THE WMS CONSTRUCTOR //CHANGE name

                //{layer: new WorldWind.BMNGOneImageLayer("../../images/moon.jpg", "Moon Image"), enabled: true}
                // {layer: new WorldWind.ViewConrolsLayer(wwd), enabled: true}
            ];

            for (var l = 0; l < layers.length; l++) {
                layers[l].layer.enabled = layers[l].enabled;
                wwd.addLayer(layers[l].layer);
            }

            wwd.redraw();
        }





        // Create a layer manager for controlling layer visibility.
        var layerManager = new LayerManager(wwd);


        // Create a coordinate controller to update the coordinate overlay elements.
        var coordinateController = new CoordinateController(wwd);
    });
