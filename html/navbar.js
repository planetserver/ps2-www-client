$(function () {
    $.widget("earthserver.navbar", {
        options: {
            serviceLogo: undefined,
            serviceLogoUrl: undefined,
            homeUrl: undefined
        },
        _create: function () {
            var self = this;
            this.element.attr({id: "service-navbar"}).addClass("navbar navbar-default navbar-fixed-top")
                .append($("<div>", {class: "container-fluid"})
                    .append($("<div>", {class: "navbar-header pull-left"})
                        .append($("<a>", {class: "navbar-brand earthserver-logo", href: "http://www.earthserver.eu"})
                            .append($("<img>", {class: "img-responsive", src: "html/images/logos/earthserver_logo.png", alt: "EarthServer Logo"}))
                        ).append($("<a>", {class: "navbar-brand service-logo"})
                            .append($("<img>", {class: "img-responsive", alt: "Service Logo"}))
                        )
                    ).append($("<div>", {class: "navbar-header pull-right"})
                    /*.append($("<div>", {/!*id: "navbar-collapse-1", *!/class: "navbar-right"})*/
                        .append($("<ul>", {class: "nav"})
                            .append($("<li>", {class: "pull-left"})
                                .append($("<a>", {class: "hidden-xs navbar-icon navbar-home-link"})
                                    .append($("<span>", {class: "hidden-xs navbar-home-link-arrow glyphicon" +
                                    " glyphicon-chevron-left"}))
                                    .append($("<span>", {class: "hidden-xs navbar-home-link-text"}).text("Back to home"))
                                ).append($("<a>", {class: "visible-xs navbar-icon navbar-home-link"})
                                    .append($("<span>", {class: "glyphicon glyphicon-home"}))
                                )
                            )
                            .append($("<li>", {class: "pull-left"})
                                .append($("<span>", {class: "divider-container", role: "separator"})
                                    .append($("<span>", {class: "divider"}))
                                )
                            ).append($("<li>", {id: "user-account", class: "pull-right"})
                                .append($("<div>", {class: "hidden-xs navbar-icon account-info"}).text("Signed in as ")
                                    .append($("<a>", {
                                        id: "account-info-toggle",
                                        class: "account-info-toggle"
                                    }).text("me"))
                                ).append($("<a>", {
                                    class: "visible-xs navbar-icon account-info-toggle"
                                }).append($("<span>", {class: "glyphicon glyphicon-user"}))
                                    .append($("<span>", {class: "navbar-user-arrow glyphicon" +
                                    " glyphicon-triangle-bottom"}))
                                )
                            )
                        )
                    )
                );
            this._buildAccountInfoCollapse();
            this.element.find((".account-info-toggle")).click(function() {
                self._onAccountIconClick();
            });
            if (this.options.serviceLogoUrl != undefined) {
                this.element.find(".service-logo").attr("href", this.options.serviceLogoUrl);
            }
            if (this.options.serviceLogo != undefined) {
                this.element.find(".service-logo > img").attr("src", this.options.serviceLogo);
            }
            if (this.options.homeUrl != undefined) {
                this.element.find(".navbar-home-link").attr("href", this.options.homeUrl);
            }
        },
        _onAccountIconClick: function() {
            var self = this;
            if (!this.accountInfoPanel.is(":visible")) {
                this.accountInfoPanel.show();
                this.accountInfoPanel.animate({
                    opacity: 1
                }, 150, function() {
                    // Animation complete.
                });
            } else {
                this.accountInfoPanel.animate({
                    opacity: 0
                }, 150, function() {
                    self.accountInfoPanel.hide();
                });
            }

        },
        _buildAccountInfoCollapse: function(element) {
            this.accountInfoPanel = $("<div>", {id: "account-info-panel", class: "panel"})
                .append($("<div>", {class: "triangle"}))
                .append($("<div>", {class: "panel-body"})

                ).appendTo($("#user-account"));
            this.accountInfoPanel.hide()
        }
    })
});
