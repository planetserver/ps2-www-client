/*
* Copyright (C) 2014 United States Government as represented by the Administrator of the
* National Aeronautics and Space Administration. All Rights Reserved.
*/
/**
* @version $Id: BasicExample.js 3320 2015-07-15 20:53:05Z dcollins $
*/

requirejs(['../src/WorldWind',
           './CoordinateController',
           './LayerManager',
           './Footprints'],
function (ww,
          CoordinateController,
          LayerManager,
          Footprints) {
    "use strict";

    WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

    var wwd = new WorldWind.WorldWindow("canvasOne");

    var layers = [
      {layer: new WorldWind.BMNGLayer("moon_wgs84"), enabled: false},
      {layer: new WorldWind.BMNGLayer("mars_wgs84"), enabled: true}
    ];

    for (var l = 0; l < layers.length; l++) {
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

    var boundary2 = [];
    boundary2.push(new WorldWind.Location(	-46.966	,	4.478	));
    boundary2.push(new WorldWind.Location(	-46.968	,	4.404	));
    boundary2.push(new WorldWind.Location(	-46.974	,	4.257	));
    boundary2.push(new WorldWind.Location(	-46.97	,	4.181	));
    boundary2.push(new WorldWind.Location(	-46.929	,	4.194	));
    boundary2.push(new WorldWind.Location(	-46.9	,	4.197	));
    boundary2.push(new WorldWind.Location(	-46.874	,	4.187	));
    boundary2.push(new WorldWind.Location(	-46.828	,	4.165	));
    boundary2.push(new WorldWind.Location(	-46.826	,	4.238	));
    boundary2.push(new WorldWind.Location(	-46.82	,	4.312	));
    boundary2.push(new WorldWind.Location(	-46.805	,	4.386	));
    boundary2.push(new WorldWind.Location(	-46.793	,	4.459	));
    boundary2.push(new WorldWind.Location(	-46.847	,	4.446	));
    boundary2.push(new WorldWind.Location(	-46.882	,	4.443	));
    boundary2.push(new WorldWind.Location(	-46.916	,	4.453	));

    var boundary3 = [];
    boundary3.push(new WorldWind.Location(	-47.067	,	4.677	));
    boundary3.push(new WorldWind.Location(	-47.073	,	4.457	));
    boundary3.push(new WorldWind.Location(	-47.074	,	4.383	));
    boundary3.push(new WorldWind.Location(	-47.034	,	4.395	));
    boundary3.push(new WorldWind.Location(	-47.009	,	4.398	));
    boundary3.push(new WorldWind.Location(	-46.985	,	4.386	));
    boundary3.push(new WorldWind.Location(	-46.944	,	4.362	));
    boundary3.push(new WorldWind.Location(	-46.924	,	4.512	));
    boundary3.push(new WorldWind.Location(	-46.904	,	4.66	));
    boundary3.push(new WorldWind.Location(	-46.958	,	4.648	));
    boundary3.push(new WorldWind.Location(	-46.99	,	4.645	));
    boundary3.push(new WorldWind.Location(	-47.022	,	4.654	));
    boundary3.push(new WorldWind.Location(	-47.067	,	4.677	));
    var boundary4 = [];
    boundary4.push(new WorldWind.Location(	-47.814	,	4.738	));
    boundary4.push(new WorldWind.Location(	-47.817	,	4.665	));
    boundary4.push(new WorldWind.Location(	-47.823	,	4.442	));
    boundary4.push(new WorldWind.Location(	-47.776	,	4.453	));
    boundary4.push(new WorldWind.Location(	-47.745	,	4.455	));
    boundary4.push(new WorldWind.Location(	-47.715	,	4.444	));
    boundary4.push(new WorldWind.Location(	-47.668	,	4.42	));
    boundary4.push(new WorldWind.Location(	-47.671	,	4.494	));
    boundary4.push(new WorldWind.Location(	-47.67	,	4.57	));
    boundary4.push(new WorldWind.Location(	-47.661	,	4.645	));
    boundary4.push(new WorldWind.Location(	-47.651	,	4.72	));
    boundary4.push(new WorldWind.Location(	-47.696	,	4.706	));
    boundary4.push(new WorldWind.Location(	-47.727	,	4.704	));
    boundary4.push(new WorldWind.Location(	-47.763	,	4.714	));

    // Create and set attributes for it. The shapes below except the surface polyline use this same attributes
    // object. Real apps typically create new attributes objects for each shape unless they know the attributes
    // can be shared among shapes.
    var attributes = new WorldWind.ShapeAttributes(null);
    attributes.outlineColor = WorldWind.Color.RED;
    attributes.drawInterior = false;
    var shape = new WorldWind.SurfacePolygon(boundary, attributes);
    shapesLayer.addRenderable(shape);
    var shape2 = new WorldWind.SurfacePolygon(boundary2, attributes);
    shapesLayer.addRenderable(shape2);
    var shape3 = new WorldWind.SurfacePolygon(boundary3, attributes);
    shapesLayer.addRenderable(shape3);
    var shape4 = new WorldWind.SurfacePolygon(boundary4, attributes);
    shapesLayer.addRenderable(shape4);
    //surface image test begin
    var surfaceImage2 = new WorldWind.SurfaceImage(new WorldWind.Sector(-47.57565, -47.36640, 4.220789, 4.535433),
    "http://212.201.45.9:8080/rasdaman/ows?query=for%20data%20in%20(%20frt00003590_07_if164l_trr3%20)%20return%20encode(%20{%20red:%20(int)(255%20/%20(max((data.band_233%20!=%2065535)%20*%20data.band_233)%20-%20min(data.band_233)))%20*%20(data.band_233%20-%20min(data.band_233));%20green:%20(int)(255%20/%20(max((data.band_78%20!=%2065535)%20*%20data.band_78)%20-%20min(data.band_78)))%20*%20(data.band_78%20-%20min(data.band_78));%20blue:(int)(255%20/%20(max((data.band_13%20!=%2065535)%20*%20data.band_13)%20-%20min(data.band_13)))%20*%20(data.band_13%20-%20min(data.band_13));%20alpha:%20(data.band_100%20!=%2065535)%20*%20255%20},%20%22png%22,%20%22nodata=null%22)");


    //Adding footprints
    var boundaries = []; // array for boundary locations of the footprints
    var shapes = []; // array for shape SurfacePolygon objects with corresponding boundaries and attributes
    for(var i = 0; i < Footprints.length; i++) {
        boundaries.push([]); // new array for the boundaries of a single footprint
        shapes.push([]);
        for(var j = 0; j < Footprints[i].latitude.length; j++) { 
            // adding all the boundaries of a single polygon into boundaries[i]           
            boundaries[i].push(new WorldWind.Location(Footprints[i].latitude[j], Footprints[i].longitude[j]));
        }
        shapes[i] = new WorldWind.SurfacePolygon(boundaries[i], attributes);
        shapesLayer.addRenderable(shapes[i]);
     }


    // Add the surface images to a layer and the layer to the World Window's layer list.
    var surfaceImageLayer = new WorldWind.RenderableLayer();
    surfaceImageLayer.displayName = "Surface Images";
    surfaceImageLayer.addRenderable(surfaceImage2);
    wwd.addLayer(surfaceImageLayer);
    shapesLayer.addRenderable(surfaceImageLayer);
    //surface image test end




    // Create a layer manager for controlling layer visibility.
    var layerManger = new LayerManager(wwd);

    // Create a coordinate controller to update the coordinate overlay elements.
    var coordinateController = new CoordinateController(wwd);
  });
