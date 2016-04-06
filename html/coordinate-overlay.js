$(function () {
    $.widget("earthserver.coordinateOverlay", {
        options: {
            container: $("#service-container")
        },
        _create: function () {
            $("<div>", {id: "coordinate-overlay"})
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: "html/images/icons/latitude(h100).png"}))
                    .append($("<span>", {id: "terrainLatitude"}))
                )
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: "html/images/icons/longitude(h100).png"}))
                    .append($("<span>", {id: "terrainLongitude"}))
                )
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: ""}))
                    .append($("<span>", {id: "terrainElevation"}))
                )
                .append($("<span>", {class: "coordinate-container"})
                    .append($("<img>", {class: "coordinate-icon", src: "html/images/icons/eye(h100).png"}))
                    .append($("<span>", {id: "eyeAltitude"}))
                ).appendTo(this.options.container);
        }
    })
});
