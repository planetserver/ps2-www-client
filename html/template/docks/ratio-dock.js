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
