requirejs(['../src/WorldWind','./LayerManager','./CoordinateController'], function (ww, LayerManager, CoordinateController) {
    var demo = {
        addInitialLayers: function (wwd) {
            var layers = [
                {layer: new WorldWind.BMNGOneImageLayer("../images/moon.jpg", "Moon Image"), enabled: true},

                {layer: new WorldWind.BMNGLayer("DTM"), enabled: false}
                //{layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
                //{layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
            ];

            for (var l = 0; l < layers.length; l++) {
                layers[l].layer.enabled = layers[l].enabled;
                wwd.addLayer(layers[l].layer);
            }
              var layerManager = new LayerManager(this.wwd);
              var coordinateController = new CoordinateController(this.wwd);
        },


        setupWW: function () {
            WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);
            //WorldWind.configuration.baseUrl = "/demo/demo-frames/ww3d/";
            // Create the World Window.
            this.wwd = new WorldWind.WorldWindow("canvasOne");
        },

        addLayer: function (request) {
          // var polygonsLayer = new WorldWind.RenderableLayer();
          // polygonsLayer.displayName = "Polygons";
          // this.wwd.addLayer(polygonsLayer);
          // // Define an outer and an inner boundary to make a polygon with a hole.
          // var boundaries = [];
          // boundaries[0] = []; // outer boundary
          // boundaries[0].push(new WorldWind.Location(-80.754, -45));
          // boundaries[0].push(new WorldWind.Location(-80.754, +45));
          // boundaries[0].push(new WorldWind.Location(-80.754, +135));
          // boundaries[0].push(new WorldWind.Location(-80.754, -135));
          // // Create the polygon and assign its attributes.
          // var polygon = new WorldWind.SurfacePolygon(boundaries, null);
          // var polygonAttributes = new WorldWind.ShapeAttributes(null);
          // polygonAttributes.drawInterior = false;
          // polygonAttributes.drawOutline = true;
          // polygonAttributes.imageSource = "../images/400x230-splash-nww.png";
          // polygon.attributes = polygonAttributes;
          // polygonsLayer.addRenderable(polygon);


              // Create a layer to hold the surface shapes.
            var shapesLayer = new WorldWind.RenderableLayer("hrs00006fea_07_if173s_trr3_CAT_phot.img.tif");
            this.wwd.addLayer(shapesLayer);

            // Create a simple surface polygon, a triangle.
            var boundary = [];
            boundary.push(new WorldWind.Location(72.86521, -87.84786));
            boundary.push(new WorldWind.Location(76.57143, -87.84738));
            boundary.push(new WorldWind.Location(76.77301, -88.04004));
            boundary.push(new WorldWind.Location(72.70216, -88.04056));
            
            

            // Create and set attributes for it. The shapes below except the surface polyline use this same attributes
            // object. Real apps typically create new attributes objects for each shape unless they know the attributes
            // can be shared among shapes.
            var attributes = new WorldWind.ShapeAttributes(null);
            attributes.outlineColor = WorldWind.Color.BLUE;
            attributes.interiorColor = new WorldWind.Color(30, 30, 30, 0.5);

            var highlightAttributes = new WorldWind.ShapeAttributes(attributes);
            highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 1);

            var shape = new WorldWind.SurfacePolygon(boundary, attributes);
            shape.highlightAttributes = highlightAttributes;
            shapesLayer.addRenderable(shape);

            
                // var surfaceImageLayer = new WorldWind.RenderableLayer();
                // surfaceImageLayer.displayName = "Timelapse Layer";
                // surfaceImageLayer.addRenderable(new WorldWind.SurfaceImage(new WorldWind.Sector(-90,0,0,180), request));
                // //surfaceImageLayer.addRenderable(new WorldWind.SurfacePolygon(boundaries, request));

                // this.removeTimelapseLayer(2);
                // this.wwd.addLayer(surfaceImageLayer);
                // this.wwd.redraw();
            },

        removeTimelapseLayer: function (max) {
            var count = 0;
            for (var j = 0; j < this.wwd.layers.length; j++) {
                if (this.wwd.layers[j].displayName == "Timelapse Layer") {
                    count++;
                }
            }
            if (count > max) {
                for (var i = 0; i < this.wwd.layers.length; i++) {
                    if (this.wwd.layers[i].displayName == "Timelapse Layer") {
                        this.wwd.removeLayer(this.wwd.layers[i]);
                        this.wwd.redraw();
                        if (max > 0) {
                            break;
                        }
                    }
                }
            }
        },

        removeAllLayers: function () {
            for (var j = 0; j < this.wwd.layers.length; j++) {
                this.wwd.removeLayer(this.wwd.layers[i]);
            }
        },


        onRetrieve: function () {
            var self = this;
            $("#retrieve").on('click', function (e) {
                e.preventDefault();
                self.callSlider();
            })
        },

        onTimelapse: function () {
            var self = this;
            self.timelapseRunning = false;
            $("#timelapse").on('click', function (e) {
                if (self.timelapseRunning) {
                    clearInterval(self.interval);
                    self.timelapseRunning = false;
                    $(this).text("Run timelapse");
                }
                else {
                    self.timelapseRunning = true;
                    $(this).text("Stop timelapse");
                    $this = $(this);
                    e.preventDefault();
                    var interval = self.interval = setInterval(function () {
                        var value = self.slider.slider('getValue') + 1;
                        var max = parseInt($("input.slider").attr('data-slider-max'), 10);
                        if (value > max) {
                            clearInterval(interval);
                            self.slider.slider("setValue", 0);
                            $this.text("Run timelapse");
                            self.timelapseRunning = false;
                        }
                        else {
                            self.callSlider();
                            self.slider.slider("setValue", value);
                        }
                    }, 2000)
                }
            })
        },

        onCombine: function () {
            var self = this;
            self.combined = false;
            $("#combine").on("click", function (e) {
                var $this = $(this);
                if (self.combined) {
                    $this.text("Combine");
                    $this.removeClass("btn-danger").addClass("btn-info");
                    //self.removeAllLayers();
                    self.combined = false;
                }
                else {
                    $this.text("Remove");
                    $this.removeClass("btn-info").addClass("btn-danger");
                    self.combined = true;
                }
                e.preventDefault();
            })
        },

        onQuery: function(){
            var self = this;
            $("#execute").on("click", function(e){
                e.preventDefault();
                var query = $("#query").val()
                var request = 'http://212.201.45.10:8080/rasdaman/ows?query=' + query
                self.addLayer(request)
            })
        },


        getTimelapseDataset: function () {
            return $("#dataset").val()
        },

        getCombineDataset: function () {
            return $("#dataset-combine").val()
        },

        callSlider: function () {
            var self = this;
            var request = self.getQuery(self.getTimelapseDataset());
            self.addLayer(request)
            if (self.combined) {
                var request2 = self.getQuery(self.getTimelapseDataset());
                self.addLayer(request2);
            }
        },

        run: function () {
            this.setupWW();
            this.addInitialLayers(this.wwd);
            this.addLayer();
            this.onRetrieve();
            this.onTimelapse();
            this.onCombine();
            this.onQuery();
            this.callSlider();

        }


        ,

        getDate: function (value) {
            return moment("2012-01", "YYYY-MM").add(value, "months").format("YYYY-MM")
        }
        ,

        getQuery: function (dataset) {
           var query = 'for%20c%20in%20(DTM_integer_latlon)%0Areturn%20encode(%0A%20(unsigned%20char)((%7B%0A%20%20%20red%3A%20%20%20((unsigned%20char)((c%20%3E%20400000)%20*%20215))%3B%0A%20%20%20green%3A%20((unsigned%20char)((c%20%3E%20400000)%20*%2025))%3B%0A%20%20%20blue%3A%20%20((unsigned%20char)((c%20%3E%20400000)%20*%2028))%0A%20%7D%0Aoverlay%0A%20(unsigned%20char)%7B%0A%20%20%20red%3A%20%20%20((unsigned%20char)((c%20%3E%3D%20300000%20and%20c%20%3C%20400000)%20*%20238))%3B%0A%20%20%20green%3A%20((unsigned%20char)((c%20%3E%3D%20300000%20and%20c%20%3C%20400000)%20*%20120))%3B%0A%20%20%20blue%3A%20%20((unsigned%20char)((c%20%3E%3D%20300000%20and%20c%20%3C%20400000)%20*%2071))%0A%20%7D%0Aoverlay%0A%20(unsigned%20char)%7B%0A%20%20%20red%3A%20%20%20((unsigned%20char)((c%20%3E%3D%20150000%20and%20c%20%3C%20300000)%20*%20253))%3B%0A%20%20%20green%3A%20((unsigned%20char)((c%20%3E%3D%20150000%20and%20c%20%3C%20300000)%20*%20199))%3B%0A%20%20%20blue%3A%20%20((unsigned%20char)((c%20%3E%3D%20150000%20and%20c%20%3C%20300000)%20*%20126))%0A%20%7D%0Aoverlay%0A%20(unsigned%20char)%7B%0A%20%20%20red%3A%20%20%20((unsigned%20char)((c%20%3E%3D%203000%20and%20c%20%3C%20150000)%20*%20253))%3B%0A%20%20%20green%3A%20((unsigned%20char)((c%20%3E%3D%203000%20and%20c%20%3C%20150000)%20*%20207))%3B%0A%20%20%20blue%3A%20%20((unsigned%20char)((c%20%3E%3D%203000%20and%20c%20%3C%20150000)%20*%20135))%0A%20%7D%0A%0Aoverlay%0A%20(unsigned%20char)%7B%0A%20%20%20red%3A%20%20%20((unsigned%20char)((c%20%3E%3D%200%20and%20c%20%3C%20150000)%20*%20159))%3B%0A%20%20%20green%3A%20((unsigned%20char)((c%20%3E%3D%200%20and%20c%20%3C%20150000)%20*%20213))%3B%0A%20%20%20blue%3A%20%20((unsigned%20char)((c%20%3E%3D%200%20and%20c%20%3C%20150000)%20*%20165))%0A%20%7D%0A%0Aoverlay%0A%20(unsigned%20char)%7B%0A%20%20%20red%3A%20%20%20((unsigned%20char)((c%20%3E%3D%20-100000%20and%20c%20%3C%200)%20*%20239))%3B%0A%20%20%20green%3A%20((unsigned%20char)((c%20%3E%3D%20-100000%20and%20c%20%3C%200)%20*%20248))%3B%0A%20%20%20blue%3A%20%20((unsigned%20char)((c%20%3E%3D%20-100000%20and%20c%20%3C%200)%20*%20185))%0A%20%7D%0A%0A%0Aoverlay%0A%20(unsigned%20char)%7B%0A%20%20%20red%3A%20%20%20((unsigned%20char)((c%20%3E%3D%20-200000%20and%20c%20%3C%20-100000)%20*%20186))%3B%0A%20%20%20green%3A%20((unsigned%20char)((c%20%3E%3D%20-200000%20and%20c%20%3C%20-100000)%20*%20227))%3B%0A%20%20%20blue%3A%20%20((unsigned%20char)((c%20%3E%3D%20-200000%20and%20c%20%3C%20-100000)%20*%20168))%0A%20%7D%0A%0Aoverlay%0A%20(unsigned%20char)%7B%0A%20%20%20red%3A%20%20%20((unsigned%20char)((c%20%3E%3D%20-300000%20and%20c%20%3C%20-200000)%20*%20147))%3B%0A%20%20%20green%3A%20((unsigned%20char)((c%20%3E%3D%20-300000%20and%20c%20%3C%20-200000)%20*%20204))%3B%0A%20%20%20blue%3A%20%20((unsigned%20char)((c%20%3E%3D%20-300000%20and%20c%20%3C%20-200000)%20*%20167))%0A%20%7D%0A%0Aoverlay%0A%20(unsigned%20char)%7B%0A%20%20%20red%3A%20%20%20((unsigned%20char)((c%20%3E%3D%20-400000%20and%20c%20%3C%20-300000)%20*%2047))%3B%0A%20%20%20green%3A%20((unsigned%20char)((c%20%3E%3D%20-400000%20and%20c%20%3C%20-300000)%20*%20133))%3B%0A%20%20%20blue%3A%20%20((unsigned%20char)((c%20%3E%3D%20-400000%20and%20c%20%3C%20-300000)%20*%20185))%0A%20%7D%0A%0A%0A))%0A%2C%0A%22png%22%2C%20%22nodata%3D0%22)';
            return 'http://212.201.44.243:8080/rasdaman/ows?query='+query;
        }


    };

    demo.run()



});
