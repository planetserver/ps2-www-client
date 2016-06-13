$(function () {
    $.widget("dock.plotDock", $.earthserver.dock, {
        options: {
            position: "right",
            toggleIcon: "html/images/icons/diagram(h100).png"
        },
        _create: function () {
            var self = this;            
            var htmlElement = "<div id='dropDownMainChartDiv' style='margin-top: -30px;'>";
            htmlElement += "<div class='dropdown'> <button class='btn btn-warning dropdown-toggle' style='float:left; font-size:12px;' type='button' data-toggle='dropdown'>Spectral Library Categories <span class='caret'></span></button> <ul class='dropdown-menu' id='dropDownCategorySpectralLibrary' style='width: 350px; max-height: 350px; overflow-y: auto;'> </ul> </div>";
            htmlElement += "<div class='dropdown'> <button class='btn btn-danger dropdown-toggle' id='btnProductSpectralLibrary' style='float:right; font-size:12px;' type='button' data-toggle='dropdown'>Spectral Library Products <span class='caret'></span></button> <ul class='dropdown-menu dropdown-menu-right' id='dropDownProductSpectralLibrary' style='width: 350px; max-height: 350px; overflow-y: auto;'> </ul> </div>";
            htmlElement += "</div>";
            htmlElement += "<div class='chartdiv' id='mainChartDiv' style='width:100%; height:480px; margin-top: 30px;'></div>";

            this.element.addClass("plot-dock");
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
