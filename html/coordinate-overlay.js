$(function () {
    $.widget("earthserver.coordinateOverlay", {
        options: {
            container: $("#service-container")
        },
        _create: function () {
            $("<div>", {id: "coordinate-overlay"})
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: "images/icons/latitude(h100)w.png"}))
                    .append($("<span>", {id: "terrain-latitude"}))
                )
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: "images/icons/longitude(h100)w.png"}))
                    .append($("<span>", {id: "terrain-longitude"}))
                )
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: ""}))
                    .append($("<span>", {id: "terrain-elevation"}))
                )
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: "images/icons/eye_no_lashes(h100)w.png"}))
                    .append($("<span>", {id: "eye-altitude"}))
                ).appendTo(this.options.container);
        }
    })
});