$(function () {
    $.widget("earthserver.service", {
        options: {},
        _create: function () {
            var self = this;

            /* main dock (required) */
            var leftDock = $("<div>").mainDock().mainDock("instance");
            /*leftDock.addQueryTerinalPanel().addQueryTerminalPanel().addQueryTerminalPanel().addQueryTerminalPanel();*/

            /*leftDock
                .addProjectionSelectPanel(function(elemClicked) {
                    console.log(elemClicked.text())
                })
                .addAvailableCoveragesPanel(function() {
                    $("#coverage-selector").find("#coverageDropdown")
                    console.log("Retrieve button clicked");
                })
                .addQueryTerminalPanel().addQueryTerminalPanel().addQueryTerminalPanel().addQueryTerminalPanel().addQueryTerminalPanel().addQueryTerminalPanel().addQueryTerminalPanel();*/

            var exampleRightDock = $("<div>").secondaryDock().secondaryDock("instance");
            exampleRightDock.addEmptyPanel();

            /* info dock (required) */
            var infoDock = $("<div>").infoDock().infoDock("instance");
            var infoPanel = infoDock.getInfoPanel()
                .addTab("about", "about", "Title1", "SubTitle1", "jndfabv adfndfvbs dfasvikjadsfv")
                .addTab("contact", "contact", "Title2", "SubTitle2", "afhofbon fbojirwegi0 fbh0bfeno")
                .addTab("tour", "tour", "Title3", "SubTitle3", "dfabhijdfb fbohidfb dfboihbfd hoibdf ");

            /* gis toolbar (required) */
            var gisToolbar = $("<div>").gisToolbar().gisToolbar("instance");
            gisToolbar.addClickHandler("#zoom-in-tool", function() {console.log("Zoom in.")});
            /* coordinates overlay (required) */
            var coordinates = $("<div>").coordinateOverlay().coordinateOverlay("instance");
        }
    })
});