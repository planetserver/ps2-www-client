$(function () {
    $.widget("dock.ratioDock", $.earthserver.dock, {
        options: {
            position: "right",
            toggleIcon: "html/images/icons/spectrum_ratio2(h100)w.png"
        },
        _create: function () {
            var self = this;
            this.element.addClass("ratio-dock");
            this._super();
            this.element.append(
                $(
                "<div style='margin-top: -70px; margin-bottom: 10px; color:white;'>"+
                      "Select numerator and denominator in order to calculate the band ratio<br/>"+
                      "<div class='radio'>"+
                            "<label id='labelNumeratorBandRatioDock' style='color:red;'><input id='numeratorBandRatioDock' type='radio' name='optradio' checked >Numerator</label>"+
			    "<img src='html/images/icons/numer.png'/>" +
                      "</div>"+
                      "<div class='radio'>"+
                            "<label id='labelDenominatorBandRatioDock' style='color:red;'><input id='denominatorBandRatioDock' type='radio' name='optradio'>Denominator</label>"+
   			    "<img src='html/images/icons/denom.png'/>" +
                      "</div>"+
                       "<span class='label label-warning' id='bandRatioNotification'></span>"+
                    "</div>"+
                    "<div class='chartdiv' id='bandRatioChartDiv' style='width:100%; height:480px;'></div>"

                )
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
