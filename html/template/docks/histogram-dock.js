$(function () {
    $.widget("dock.histogramDock", $.earthserver.dock, {
        options: {
            position: "right",
            toggleIcon: "html/images/icons/diagram(h100).png"
        },
        _create: function () {
            var self = this;
            var htmlElement = "<hr style='margin-bottom: 7px; margin-top: -15px;'>";

            htmlElement += "<div style='margin-top: 10px; color: #f90909;'> Band 1 range: <p id='band1ValueRange' style='font-weight:bold; margin-left: 25px; display:inline;'> 0 - 255 </p> <div id='sliderBand1Histogram' style='margin-top: 5px; width: 65%; float: right;'></div> </div>";

            htmlElement += "<div style='margin-top: 10px; color: #02e515;'> Band 2 range: <p id='band2ValueRange' style='font-weight:bold; margin-left: 25px; display:inline;'> 0 - 255 </p> <div id='sliderBand2Histogram' style='margin-top: 5px; width: 65%; float: right;'></div> </div>";

            htmlElement += "<div style='margin-top: 10px; color: #6ebcff;'> Band 3 range: <p id='band3ValueRange' style='font-weight:bold; margin-left: 25px; display:inline;'>  0 - 255 </p> <div id='sliderBand3Histogram' style='margin-top: 5px; width: 65%; float: right;'></div> </div>";

            htmlElement += "<button type='button' id='btnDownloadPNGImageHistogramChart' style='font-size: 12px; float: left; margin-top: 10px; width: 40%;' class='btn btn-success'>Download PNG Image Result</button> </div> ";

            htmlElement += "<button type='button' id='btnNewMinMaxBandsHistogramChart' style='font-size: 12px; float: right; margin-top: 10px; width: 45%;' class='btn btn-danger'>Load new min, max for 3 bands</button> </div> ";

	    htmlElement += "<div class='chartdiv' id='HistogramChartDiv' style='width:100%; height:440px; margin-top: 60px;'></div>";

            this.element.addClass("histogram-dock");
            this._super();
            /*this.element.append($("<span>", {class: "remove-plot"})
                .append($("<span>", {class: "remove-plot-icon glyphicon glyphicon-remove"}))
                .click(function() {
                    self.close();
                    self.element.find(".panel-body").empty();
                }));*/
	        this.element.append(
                $( htmlElement )
	        );

            this.dockToggleIconWrapper.append(
                $("<img>", {class: "dock-toggle-icon", src: this.options.toggleIcon})

            );
            this.addEmptyPanel();
        }
    })
});
