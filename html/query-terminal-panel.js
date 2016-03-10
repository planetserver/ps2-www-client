$(function () {
    $.widget("panel.queryTerminalPanel", $.dock.panel, {
        options: {
            panelType: "query-terminal"
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(
                    $("<textarea>", {class: "code-area"})
                )
            ;
            this.addButton("Run Query").addButton("Reset");
        }
    })
});