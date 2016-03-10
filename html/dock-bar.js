$(function () {
    $.widget("earthserver.dock", {
        options: {
            container: $("#service-container"),
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
            return $("<div>").panel({
                dock: this.dock,
                panelId: panelId
            }).panel("instance");
        }
    })
});