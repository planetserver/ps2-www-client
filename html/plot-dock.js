$(function () {
    $.widget("dock.plotDock", $.earthserver.dock, {
        options: {
            position: "right",
            toggleIcon: "images/icons/diagram(h100).png"
        },
        _create: function () {
            this._super();
            this.element.addClass("plot-dock");
            this.dockToggle.append(
                $("<img>", {class: "dock-toggle-icon", src: this.options.toggleIcon})
            );
            this.plotPanel = this.addPlotPanel();
        },
        addPlotPanel: function() {
            return $("<div>").tabPanel({
                dock: this.dock,
                panelId: "plot-panel"
            }).tabPanel("instance");
        },
        getPlotPanel: function() {
            return this.plotPanel;
        }
    })
});
