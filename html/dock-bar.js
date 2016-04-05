$(function () {
    $.widget("earthserver.dock", {
        options: {
            container: $("#service-container"),
            position: "",
            toggleIcon: undefined
        },
        _create: function () {
            var self = this;
            this._initDock();
            this.scrollbar = this.element.mCustomScrollbar({
                theme: "light-thin",
                mouseWheel: {
                    disableOver: ["textarea"]
                }
            });
        },
        _initDock: function () {
            var self = this;
            var rightDocks = $(".right-dock");

            this.dock = this.element.addClass("container-fluid dock " + this.options.position + "-dock")
                .appendTo(this.options.container);
            this.dockId = this.dock.uniqueId().attr("id");
            if (this.options.position == "left") {
                this.dock.addClass("extra-right-padding");
                this.dock.position({
                    my: "right top",
                    at: "left+40 top+70",
                    of: "#service-container"
                });
                $(window).resize(function() {
                    if (self.options.position == "left") {
                        if ($(window).width() < 992) {
                            var leftDockOpen = self.dock.hasClass("open");
                            $(".dock").each(function(index, item) {
                                if (leftDockOpen && $(this).hasClass("right-dock") && $(this).hasClass("open")) {
                                    $(this).removeClass("open");
                                }
                            });
                        }
                        if (self.dock.hasClass("open")) {
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
            this.dockToggle = $("<div>", {class: "no-select dock-toggle "
                + this.options.position + "-dock-toggle"})
                .click(function () {
                    $(".right-dock").filter(function() {
                        return $(this).attr("id") != self.dockId;
                     }).addClass("bring-on-top");
                    var openDocks = $(".dock.open");

                    self.dock.hasClass("open") ? self.close() : self.open();
                    if ($(window).width() < 992) {
                        openDocks.each(function (index, item) {
                            $.each($(this).data(), function(key, value) {
                                if (key.match("^dock-")) {
                                    $(item).data(key).close();
                                }

                            });
                        })
                    }
                })
                .appendTo(this.dock);
            this.dockToggleIconWrapper = $("<div>", {class: "dock-toggle-icon-wrapper"}).appendTo(this.dockToggle);
            this.dockToggle.css({"margin-top": (rightDocks.length * 40) + "px"});

            this.dock.bind($.support.transition.end,
                function(e) {
                    if (!$(e.target).hasClass("dock-toggle")) {
                        $(".bring-on-top").removeClass("bring-on-top");
                    }
                });
        },
        open: function() {
            if (this.options.position == "left") {
                if (!this.dock.hasClass("open")) {
                    this.dock.position({
                        my: "left top",
                        at: "left top+70",
                        of: "#service-container"
                    });
                    this.dock.addClass("open");
                    this.dock.removeClass("extra-right-padding");
                }
            } else {
                var dockOpen = this.dock.hasClass("open");
                if (!dockOpen) {
                    $("." + this.options.position + "-dock.open").removeClass("open");
                    this.dock.addClass("open");
                }
            }
        },
        close: function() {
            if (this.options.position == "left") {
                if (this.dock.hasClass("open")) {
                    this.dock.position({
                        my: "right top",
                        at: "left+40 top+70",
                        of: "#service-container"
                    });
                    this.dock.removeClass("open");
                    this.dock.addClass("extra-right-padding");
                }
            } else {
                this.dock.removeClass("open");
            }
        },
        addEmptyPanel: function (panelId) {
            return $("<div>").panel({
                dock: this.dock,
                panelId: panelId
            }).panel("instance");
        }
    })
});