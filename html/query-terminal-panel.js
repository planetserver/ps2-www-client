$(function () {
    $.widget("panel.queryTerminalPanel", $.dock.panel, {
        options: {
            panelType: "query-terminal",
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(
                    $("<textarea>", {class: "code-area"})
                )
            ;
            this.addButton("run-query", "Run Query").addButton("reset-query", "Reset");
        }
    })
});