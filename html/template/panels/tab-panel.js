$(function () {
    $.widget("panel.tabPanel", $.dock.panel, {
        options: {
            panelType: "tab"
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(
                    $("<ul>", {class: "nav nav-tabs", role: "tablist"})
                ).append(
                $("<div>", {class: "tab-content"})
            );
        },
        addTab: function (tabId, tabText, contentTitle, contentSubtitle, content) {
            var tab = $("<li>", {role: "presentation"})
                .append($("<a>", {
                    href: "#" + tabId,
                    "aria-controls": tabId,
                    role: "tab",
                    "data-toggle": "tab"
                }).text(tabText))
                .appendTo(this.panelBody.find(".nav-tabs"));

            var tabPanel = $("<div>", {role: "tabpanel", class: "tab-pane", id: tabId})
                .appendTo(this.panelBody.find(".tab-content"));
            this._buildTabContent(tabPanel, contentTitle, contentSubtitle, content);

            if (this.panelBody.find(".nav-tabs").children().length == 1) {
                tab.addClass("active");
                tabPanel.addClass("active");
            }

            return this;
        },
        _buildTabContent: function(tabPanel, title, subtitle, content) {
            tabPanel
                .append(
                    $("<div>", {class: "panel panel-default"})
                        .append($("<div>", {class: "panel-heading"})
                            .append($("<div>", {class: "panel-title"})
                                .append(title))
                            .append($("<div>", {class: "panel-title panel-subtitle"})
                                .append(subtitle))
                        )
                        .append($("<div>", {class: "panel-body"})
                            .append(content)));
        }
    })
});