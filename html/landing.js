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
        {layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: false},
        {layer: new WorldWind.BMNGLayer("mars_wgs84"), enabled: true},
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
         boundary.push(new WorldWind.Location(-47.548, 4.535)); 
        boundary.push(new WorldWind.Location(-47.552, 4.46 ));  
        boundary.push(new WorldWind.Location(-47.563, 4.389 )); 
        boundary.push(new WorldWind.Location(-47.575, 4.318)); 
        boundary.push(new WorldWind.Location(-47.574, 4.241)); 
        boundary.push(new WorldWind.Location(-47.521, 4.254)); 
        boundary.push(new WorldWind.Location(-47.489, 4.258)); 
        boundary.push(new WorldWind.Location(-47.457, 4.247)); 
        boundary.push(new WorldWind.Location(-47.409, 4.221)); 
        boundary.push(new WorldWind.Location(-47.407, 4.295)); 
        boundary.push(new WorldWind.Location(-47.404, 4.37)); 
        boundary.push(new WorldWind.Location(-47.384, 4.448)); 
        boundary.push(new WorldWind.Location(-47.366, 4.524)); 
        boundary.push(new WorldWind.Location(-47.441, 4.505)); 
        boundary.push(new WorldWind.Location(-47.472, 4.499 )); 
        boundary.push(new WorldWind.Location(-47.5 , 4.508)); 




        // Create and set attributes for it. The shapes below except the surface polyline use this same attributes
        // object. Real apps typically create new attributes objects for each shape unless they know the attributes
        // can be shared among shapes.
        var attributes = new WorldWind.ShapeAttributes(null);
        attributes.outlineColor = WorldWind.Color.RED;
        attributes.drawInterior = false;
        var shape = new WorldWind.SurfacePolygon(boundary, attributes);
        shapesLayer.addRenderable(shape);

        //surface image test begin
        var surfaceImage2 = new WorldWind.SurfaceImage(new WorldWind.Sector(-47.57565, -47.36640, 4.220789, 4.535433),
        "http://212.201.45.10:8080/rasdaman/ows?query=for%20data%20in%20(%20esp_test_frt00003590_07_if164l_trr3%20)%20return%20encode(%20(int)(255%20/%20(max(%20(data.band_100%20!=%2065535)%20*%20data.band_100)%20-%20min(data.band_100)))%20*%20(data.band_100%20-%20min(data.band_100)),%20%22png%22,%22nodata=null%22)");

        // Add the surface images to a layer and the layer to the World Window's layer list.
        var surfaceImageLayer = new WorldWind.RenderableLayer();
        surfaceImageLayer.displayName = "Surface Images";
        surfaceImageLayer.addRenderable(surfaceImage2);
        wwd.addLayer(surfaceImageLayer);
        shapesLayer.addRenderable(surfaceImageLayer);
        //surface image test end


        var layerRegognizer = function (o) {
            // X and Y coordinates of a single click
            var x = o.clientX,
                y = o.clientY;
            console.log("The coordinates are: " + x + " " + y);
            var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

            console.log(pickList);

            for (var p = 0; p < pickList.objects.length; p++) {
                // console.log("pickList.objects[p]: " + pickList.objects[p]);
                // console.log("pickList.objects[p].userObject: " + pickList.objects[p].userObject);

                if(pickList.objects[p].userObject === surfaceImage2) {
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
              {layer: new WorldWind.BMNGLayer("mars_wgs84"), enabled: true},
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
              {layer: new WorldWind.BMNGLayer("mars_wgs84"), enabled: false},
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
              {layer: new WorldWind.BMNGLayer("mars_wgs84"), enabled: false},
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
