$(function () {
    $.widget("panel.queryTerminalPanel", $.dock.panel, {
        options: {
            panelType: "query-terminal",
            collapsible: true
        },
        _create: function () {
            var self = this;
            this._super();
            
            this._buildCustomQueriesDropdown();
            this.terminal = $("<textarea>").appendTo(this.panelBody);
            this.terminal.codeArea();

            this.addButton("run-query", "Run Query").addButton("reset-query", "Reset");
            this.panel.find("#run-query").click(function() {
                console.log($("#code-area").codeArea("getValue"));
            });
            this.panel.find("#reset-query").click(function() {
                $.each(customWCPSQueries, function(index, item) {
                    self.terminal.codeArea("reset");
                    if (item.name == self.dropdown.find(".selector-btn-content").text()) {
                        self.terminal.codeArea("setValue", item.value);
                    }
                });
            });
        },
        _buildCustomQueriesDropdown: function() {
            var self = this;
            this.dropdown = $("<div>", {id: "custom-query-selector", class: "dropdown selector"})
                .append(
                    $("<button>", {
                        class: "btn btn-default dropdown-toggle selector-btn",
                        type: "button",
                        "data-toggle": "dropdown",
                        "aria-haspopup": "true",
                        "aria-expanded": "false"
                    }).append($("<span>", {class: "selector-btn-wrapper"})
                        .append(
                            $("<span>", {class: "selector-btn-content"}).append("Select WCPS Query"))
                        .append(
                            $("<span>", {class: "glyphicon glyphicon-chevron-down"})
                        )
                    )
                ).appendTo(this.panelBody);
            var dropdownMenu = $("<ul>", {class: "dropdown-menu", "aria-labelledby": "buttonId"}).appendTo(this.dropdown);

            var defaultOptionName = "Select WCPS Query";
            var defaultOptionNameId = defaultOptionName.toLowerCase().replace(" ", "-");
            $("<li>").append(
                $("<a>", {href: "#" + defaultOptionNameId})
                    .append(defaultOptionName)
                    .click(function() {
                        var buttonContent = self.panelBody.find(".selector-btn-content");
                        buttonContent.empty();
                        buttonContent.append($(this).text());
                        self.terminal.codeArea("reset");
                    })).appendTo(dropdownMenu);

            $.each(customWCPSQueries, function(index, item) {
                self._addCustomQuery(item.name, item.value);
            });
            
            return this;
        },
        _addCustomQuery: function (queryName, queryValue) {
            var self = this;
            $("<li>").append(
                $("<a>", {href: "#" + queryName.toLowerCase().replace(" ", "-")})
                    .append(queryName)
                    .click(function() {
                        var buttonContent = self.panelBody.find(".selector-btn-content");
                        buttonContent.empty();
                        buttonContent.append($(this).text());
                        self.terminal.codeArea("setValue", queryValue);
                    })).appendTo(this.panelBody.find(".dropdown-menu"));

            return this;
        }
    })
});