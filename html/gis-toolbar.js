$(function () {
    $.widget("earthserver.gisToolbar", {
        options: {
            container: $("#service-container")
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
                        $("<img>", {class: "gis-icon", src: "html/images/icons/zoom_in(h100).png"})

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
                        $("<img>", {class: "gis-icon", src: "html/images/icons/zoom_out(h100).png"})
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
                        $("<img>", {class: "gis-icon", src: "html/images/icons/fit_to_screen(h100).png"})
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
                        $("<img>", {class: "gis-icon", src: "html/images/icons/linear_distance(h100).png"})
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
                        $("<img>", {class: "gis-icon", src: "html/images/icons/pan(h100).png"})
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
        addTool: function (icon, title) {
            this.element.append(
                $("<div>", {
                    class: "gis-icon-container",
                    "data-toggle": "tooltip",
                    "data-placement": "left",
                    "data-container": "body",
                    "title": title
                }).append(
                    $("<img>", {class: "gis-icon", src: icon})
                )
            );
        }
    })
});
