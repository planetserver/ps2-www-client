$(function () {
    $.widget("dock.panel", {
        options: {
            dock: undefined,
            panelId: undefined,
            panelType: "empty",
            panelTitle: "",
            panelSubtitle: ""
        },
        _create: function () {
            var panel = this._buildPanel();
            var container;
            if (this.options.dock.find(".mCSB_container").length > 0) {
                container = this.options.dock.find(".mCSB_container");
            } else {
                container = this.options.dock;
            }

            panel.panel.appendTo(container);
            this.panel = panel.panel;
            this.panelBody = panel.panelBody;
        },
        addButton: function(buttonId, buttonContent) {
            var buttonContainer = this.panelBody.find(".panel-btn-container");
            if (buttonContainer.length == 0) {
                buttonContainer = $("<div>", {class: "panel-btn-container"})
                    .appendTo(this.panelBody);
            }
            var button = $("<button>", {id: buttonId, class: "btn btn-default panel-btn"})
                .append(buttonContent)
                .appendTo(buttonContainer);

            return this;
        },
        _buildPanel: function() {
            var panel = $("<div>", {id: this.options.panelId, class: "panel panel-default " + this.options.panelType + "-panel"});
            if (this.options.panelType != "tab") {
                panel.append(
                    $("<div>", {class: "panel-heading"})
                        .append(
                            $("<h3>", {class: "panel-title"})
                                .append(this.options.panelTitle)
                        )
                        .append(
                            $("<h4>", {class: "panel-title panel-subtitle"})
                                .append(this.options.panelSubtitle)
                            )
                );
            }
            var panelBody = $("<div>", {class: "panel-body"})/*.append(bodyContent)*/
                .appendTo(panel);

            return {panel: panel, panelBody: panelBody};
        }
    })
});