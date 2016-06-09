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
                "<div>"+
                      "Set WCPS query to selected radio button then click on loaded footprint for calculating band-ratio.<br/>"+
                      "<div class='radio'>"+
                            "<label><input type='radio' name='optradio' checked id='bandRatioNumerator'>Numerator</label>"+
                      "</div>"+
                      "<div class='radio'>"+
                            "<label><input type='radio' name='optradio' id='bandRatioDenominator'>Denominator</label>"+
                      "</div>"+
                       "<span class='label label-warning' id='bandRatioNotification'></span>"+
                    "</div>"+
                    "<div class='chartdiv' id='bandRatioChartDiv'></div>"

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
