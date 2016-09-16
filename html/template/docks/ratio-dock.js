$(function () {
    $.widget("dock.ratioDock", $.earthserver.dock, {
        options: {
            position: "right",
            toggleIcon: "html/images/icons/spectrum_ratio2(h100)w.png"
        },
        _create: function () {
            var self = this;

            var htmlElement = "<div style='margin-top: -70px; margin-bottom: 10px; color:white;'>";
                htmlElement += "Select numerator and denominator in order to calculate the band ratio<br/>";
                htmlElement +=  "<div class='radio'>";
                htmlElement +=      "<label id='labelNumeratorBandRatioDock' style='color:red;'><input id='numeratorBandRatioDock' type='radio' name='optradio' checked >Numerator</label>";
                htmlElement +=      "<img src='html/images/icons/numer.png'/>";
                htmlElement +=      "<label id='labelDenominatorBandRatioDock' style='color:red;'><input id='denominatorBandRatioDock' type='radio' name='optradio'>Denominator</label>";
                htmlElement +=      "<img src='html/images/icons/denom.png'/>";
                htmlElement +=      "<span class='label label-warning' style='font-size: 12px;' id='bandRatioNotification'></span>";
                htmlElement +=  "</div>";
                htmlElement += "</div>";

                htmlElement += "<div id='dropDownRatioChartDiv'";
                htmlElement += "<div class='radio' style='color:white;'> <label class='radio-inline'> <input type='radio' name='radioChartsRatioChart' id='radioBtnAddChartRatioChart' >Add spectra</label> <label class='radio-inline'> <input type='radio' name='radioChartsRatioChart' id='radioBtnUpdateChartRatioChart' checked>Update spectra</label>   <label>Range Charts </label> <input id='txtRangeChartsRatioChart' type='text' value='1-4' size='8' style='color:blue; margin-left: 10px;'> (µm)   <button type='button' id='btnClearChartsRatioChart' style='font-size: 10px; float: right;' class='btn btn-success'>Clear all spectra</button> </div> <hr style='margin-bottom: 7px; margin-top: 15px;'>";
                htmlElement += "<div class='dropdown'> <button class='btn btn-warning dropdown-toggle' style='float:left; font-size:12px;' type='button' data-toggle='dropdown'>Spectral Library Categories <span class='caret'></span></button> <ul class='dropdown-menu' id='dropDownCategorySpectralLibraryRatioChart' style='max-width: 350px; max-height: 350px; overflow-y: auto;'> </ul> </div>";
                htmlElement += "<div class='dropdown'> <button class='btn btn-danger dropdown-toggle' id='btnProductSpectralLibraryRatioChart' style='float:right; font-size:12px;' type='button' data-toggle='dropdown'>Spectral Library Products <span class='caret'></span></button> <ul class='dropdown-menu dropdown-menu-right' id='dropDownProductSpectralLibraryRatioChart' style='min-width: 300px; max-width: 350px; max-height: 350px; overflow-y: auto;'> </ul> </div>";
                htmlElement += "</div>";

                htmlElement += "<div class='chartdiv' id='RatioChartDiv' style='width:100%; height:440px; margin-top: 70px;'></div>";

            this.element.addClass("ratio-dock");
            this._super();
            this.element.append(
                $( htmlElement )
            );
            this.element.append($("<span>", {class: "remove-plot"})
                .append($("<span>", {class: "remove-plot-icon glyphicon glyphicon-remove"}))
                .click(function() {
                    self.close();
                    self.element.find(".panel-body").empty();
                }));
            this.dockToggleIconWrapper.append(
                $("<img>", {class: "dock-toggle-icon", src: this.options.toggleIcon})

            );
            this.addEmptyPanel();
        }
    })
});
