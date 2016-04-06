$(function () {
    $.widget("dock.infoDock", $.earthserver.dock, {
        options: {
            position: "right",
            toggleIcon: "html/images/icons/info(h100).png"
        },
        _create: function () {
            this.element.addClass("info-dock");
            this._super();
            this.dockToggleIconWrapper.append(
                $("<img>", {class: "dock-toggle-icon", src: this.options.toggleIcon})
            );
            this.infoPanel = this.addInfoPanel();
        },
        addInfoPanel: function() {
            return $("<div>").tabPanel({
                dock: this.dock,
                panelId: "info-panel"
            }).tabPanel("instance");
        },
        getInfoPanel: function() {
            return this.infoPanel;
        }
    })
});
