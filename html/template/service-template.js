$(function () {
    $.widget("earthserver.dock", {
        options: {
            container: undefined,
            position: "",
            toggleIcon: undefined
        },
        _create: function () {
            this._initDock();
            this.element.mCustomScrollbar({
                /*axis: "yx",*/
                theme: "light-thin"
            });
        },
        _initDock: function () {
            var self = this;
            var rightDocks = $(".right-dock");

            this.dock = this.element.addClass("container-fluid extra-right-padding dock " + this.options.position + "-dock")
                .appendTo(this.options.container);
            if (this.options.position == "left") {
                this.dock.position({
                    my: "right top",
                    at: "left+40 top+70",
                    of: "#service-container"
                });
                $(window).resize(function() {
                    if (self.options.position == "left") {
                        if (self.dockToggle.hasClass("open")) {
                            self.dock.position({
                                my: "left top",
                                at: "left top+70",
                                of: "#service-container"
                            });
                        } else {
                            self.dock.position({
                                my: "right top",
                                at: "left+40 top+70",
                                of: "#service-container"
                            });
                        }
                    }

                });
            }

            this.dockToggle = $("<div>", {class: "dock-toggle "
            + this.options.position + "-dock-toggle"})
            /*.append($("<img>", {src: this.options.toggleIcon, class: "dock-toggle-icon"}))*/
                .click(function () {
                    if (self.options.position == "left") {
                        if ($(this).hasClass("open")) {
                            self.dock.position({
                                my: "right top",
                                at: "left+40 top+70",
                                of: "#service-container"
                            });

                            $(this).removeClass("open");
                            self.dock.removeClass("open");
                            self.dock.addClass("extra-right-padding");
                        } else {
                            self.dock.position({
                                my: "left top",
                                at: "left top+70",
                                of: "#service-container"
                            });
                            $(this).addClass("open");
                            self.dock.addClass("open");
                            self.dock.removeClass("extra-right-padding");
                        }
                    } else {
                        var toggleOpen = $(this).hasClass("open");

                        $("." + self.options.position + "-dock-toggle.open").removeClass("open");
                        $("." + self.options.position + "-dock.open").removeClass("open");

                        if (!toggleOpen) {
                            $(this).addClass("open");
                            self.dock.addClass("open");
                            self.dock.removeClass("extra-right-padding");
                        } else {
                            $(this).removeClass("open");
                            self.dock.removeClass("open");
                            self.dock.addClass("extra-right-padding");
                        }
                    }


                })
                .appendTo(this.dock);

            this.dockToggle.css({"margin-top": (rightDocks.length * 40) + "px"});
        },
        addEmptyPanel: function (panelId) {
            return $("<div>").tabPanel({
                dock: this.dock,
                panelId: panelId,
                panelType: "tab"
            }).tabPanel("instance");
        }
    })
});

$(function () {
    $.widget("dock.mainDock", $.earthserver.dock, {
        options: {
            position: "left",
            toggleIcon: "glyphicon glyphicon-menu-hamburger"
        },
        _create: function () {
            this._super();
            this.dockToggle
                .append(
                    $("<span>", {class: this.options.toggleIcon + " dock-toggle-icon"})
                );
        },
        addProjectionSelectPanel: function (callback) {
            var projectionSelectPanel = $("<div>").selectPanel({
                dock: this.dock,
                panelId: "projection-selector",
                panelTitle: "projections",
                buttonId: "projectionDropdown"
            }).selectPanel("instance");

            $.each(projectionNames, function (index, projection) {
                if (index == 0) {
                    projectionSelectPanel.setButtonContent(projection);
                }
                projectionSelectPanel.addSelectOption(projection.replace(/ /g, '').toLowerCase(), projection, callback);
            });
            return this;
        },
        addAvailableCoveragesPanel: function() {
            var coverageSelectPanel = $("<div>").selectPanel({
                dock: this.dock,
                panelId: "coverage-selector",
                panelTitle: "available base maps",
                buttonId: "coverageDropdown"
            }).selectPanel("instance");

            $.each(coverageNames, function (index, coverage) {
                if (index == 0) {
                    coverageSelectPanel.setButtonContent(coverage);
                }
                coverageSelectPanel.addSelectOption(coverage.replace(/ /g, '').toLowerCase(), coverage);
            });
            coverageSelectPanel.addButton("Retrieve");

            return this;
        },
        addQueryTerminalPanel: function() {
            var queryTerminalPanel = $("<div>").queryTerminalPanel({
                dock: this.dock,
                panelId: "query-terminal",
                panelTitle: "wcps query"
            }).queryTerminalPanel("instance");

            return this;
        }
    })
});

$(function () {
    $.widget("dock.infoDock", $.earthserver.dock, {
        options: {
            position: "right",
            toggleIcon: "images/icons/info(h100)w.png"
        },
        _create: function () {
            this._super();
            this.element.addClass("info-dock");
            this.dockToggle.append(
                $("<img>", {class: "dock-toggle-icon", src: this.options.toggleIcon})
            );
        },
        addInfoPanel: function() {
            return $("<div>").tabPanel({
                dock: this.dock,
                panelId: "docs-panel"
            }).tabPanel("instance");
        }
    })
});

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
        addButton: function(buttonContent) {
            var buttonContainer = this.panelBody.find(".panel-btn-container");
            if (buttonContainer.length == 0) {
                buttonContainer = $("<div>", {class: "panel-btn-container"})
                    .appendTo(this.panelBody);
            }
            $("<button>", {class: "btn btn-default panel-btn"})
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

$(function () {
    $.widget("panel.selectPanel", $.dock.panel, {
        options: {
            panelType: "select",
            buttonId: undefined,
            buttonContent: undefined
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(
                    $("<div>", {class: "dropdown selector"})
                        .append(
                            $("<button>", {
                                id: this.options.buttonId,
                                class: "btn btn-default dropdown-toggle selector-btn",
                                type: "button",
                                "data-toggle": "dropdown",
                                "aria-haspopup": "true",
                                "aria-expanded": "false"
                            }).append($("<span>", {class: "selector-btn-wrapper"})
                                .append(
                                    $("<span>", {class: "selector-btn-content"}).append(this.options.buttonContent))
                                .append(
                                    $("<span>", {class: "glyphicon glyphicon-chevron-down"})
                                )
                            )
                        ).append(
                        $("<ul>", {class: "dropdown-menu", "aria-labelledby": "buttonId"})
                            .append($("<div>", {class: "triangle"}))
                    )
                ).appendTo(this.dock);

            /*if (options != undefined && options.isArray()) {
             var optionsContainer = select.find(".dropdown-menu");
             $.each(options, function (index, option) {
             $("<li>").append(
             $("<a>", {href: "#" + option.id})
             .append(option.content)
             ).appendTo($(button.siblings(".dropdown-menu")));
             });
             }*/

            return this;
        },
        addSelectOption: function (optionId, optionContent) {
            var self = this;
            var id;
            $("<li>").append(
                $("<a>", {href: "#" + optionId})
                    .append(optionContent)
                    .click(function() {
                        var buttonContent = self.panelBody.find(".selector-btn-content");
                        buttonContent.empty();
                        buttonContent.append($(this).text());
                    })).appendTo(this.panelBody.find(".dropdown-menu"));

            return this;
        },
        setButtonContent: function(content) {
            this.panelBody.find(".selector-btn-content").append(content);
        }
    })
});

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

$(function () {
    $.widget("panel.queryTerminalPanel", $.dock.panel, {
        options: {
            panelType: "query-terminal"
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(

                ).append(
                $("<textarea>", {class: "code-area"})
            ).append(
                $("<div>", {class: "panel-btn-container"})
                    .append(
                        $("<div>", {class: "btn btn-default panel-btn"})
                            .append("Run Query")
                    ).append(
                    $("<div>", {class: "btn btn-default panel-btn"})
                        .append("Reset")
                )
            );
        }
    })
});

$(function () {
    $.widget("earthserver.gisToolbar", {
        options: {
            container: undefined
        },
        _create: function () {
            this.element.attr({id: "gis-toolbar"})
                .append(
                    $("<div>", {
                        id: "zoom-in-tool",
                        class: "gis-icon-container",
                        "data-toggle": "tooltip",
                        "data-placement": "left",
                        "data-container": "body",
                        "title": "Zoom In"
                    }).append(
                        $("<img>", {class: "gis-icon", src: "images/icons/zoom_in(h100)w.png"})
                    )
                ).append(
                $("<div>", {
                    id: "zoom-out-tool",
                    class: "gis-icon-container",
                    "data-toggle": "tooltip",
                    "data-placement": "left",
                    "data-container": "body",
                    "title": "Zoom Out"
                }).append(
                    $("<img>", {class: "gis-icon", src: "images/icons/zoom_out(h100)w.png"})
                        .click(function () {
                            console.log("Zooming out");
                        })
                )
            ).append(
                $("<div>", {
                    id: "fit-to-screen-tool",
                    class: "gis-icon-container",
                    "data-toggle": "tooltip",
                    "data-placement": "left",
                    "data-container": "body",
                    "title": "Fit to Screen"
                }).append(
                    $("<img>", {class: "gis-icon", src: "images/icons/fit_to_screen(h100)w.png"})
                        .click(function () {
                            console.log("Zooming in");
                        })
                )
            ).append(
                $("<div>", {
                    id: "select-tool",
                    class: "gis-icon-container",
                    "data-toggle": "tooltip",
                    "data-placement": "left",
                    "data-container": "body",
                    "title": "Select"
                }).append(
                    $("<img>", {class: "gis-icon", src: "images/icons/select(h100)w.png"})
                        .click(function () {
                            console.log("Zooming in");
                        })
                )
            ).append(
                $("<div>", {
                    id: "pan-tool",
                    class: "gis-icon-container",
                    "data-toggle": "tooltip",
                    "data-placement": "left",
                    "data-container": "body",
                    "title": "Pan"
                }).append(
                    $("<img>", {class: "gis-icon", src: "images/icons/pan(h100)w.png"})
                        .click(function () {
                            console.log("Zooming in");
                        })
                )
            ).appendTo(this.options.container);

            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
        },
        addClickHandler: function (selector, callback) {
            this.element.find(selector)
                .off("click")
                .click(function() {
                    callback()
                });
        },
        addTool: function (icon, title, callback) {
            this.element.append(
                $("<div>", {
                    class: "gis-icon-container",
                    "data-toggle": "tooltip",
                    "data-placement": "left",
                    "data-container": "body",
                    "title": title
                }).append(
                    $("<img>", {class: "gis-icon", src: icon})
                        .click(function () {
                            callback();
                        })
                )
            );
        }
    })
});

$(function () {
    $.widget("earthserver.coordinateInfo", {
        options: {
            container: undefined
        },
        _create: function () {
            $("<div>", {id: "coordinate-overlay"})
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: "images/icons/latitude(h100)w.png"}))
                    .append($("<span>", {id: "terrain-latitude"})
                        .text("39.17°S"))
                )
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: "images/icons/longitude(h100)w.png"}))
                    .append($("<span>", {id: "terrain-longitude"})
                        .text("0.63°E"))
                )
                /*.append($("<span>", {class: "coordinate-container"})
                 .append($("<img>", {class: "coordinate-icon", src: ""}))
                 .append($("<span>", {id: "terrain-elevation"}))
                 )*/
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: "images/icons/eye_no_lashes(h100)w.png"}))
                    .append($("<span>", {id: "eye-altitude"})
                        .text("1,870 km"))
                ).appendTo(this.options.container);
        }
    })
});

$(function () {
    $.widget("earthserver.codeArea", {
        options: {

        },
        _create: function () {
            var lineNumbers = $("<div>", {class: "line-numbers"}).appendTo(this.element);
        }
    })
});
