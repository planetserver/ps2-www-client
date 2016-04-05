$(function () {
    $.widget("earthserver.service", {
        options: {},
        _create: function () {
            var self = this;

            

            /* main dock (required) */
            var leftDock = $("<div>").mainDock().mainDock("instance");
            leftDock.addCheckedCoveragesPanel();
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

            var plotDock = $("<div>").plotDock().plotDock("instance");
            //plotDock.addEmptyPanel();


            /* info dock (required) */
            var infoDock = $("<div>").infoDock().infoDock("instance");
            var infoPanel = infoDock.getInfoPanel()
                .addTab("about", "about", "PlanetServer-2", "", "PlanetServer is a Service component of the EC-funded EarthServer-2 project (#654367) aimed at serving and analyzing planetary data online, mainly through OGC Web Coverage Processing Service (WCPS). The focus of PlanetServer is on complex data, particularly hyperspectral imaging and topographic ones. Data from Mars, the Moon and other Solar System Bodies will be available and queriable.")
                .addTab("contact", "contact", "Contact information", "", "<p>Project Manager - <a href=mailto:an.rossi@jacobs-university.de>Dr.Angelo Pio Rossi</a></p><p>Lead Developer - <a href=mailto:r.marcofiguera@jacobs-univesity.de>Ramiro Marco Figuera</a></p>")
                .addTab("tour", "tour", "Tour", "", "Coming soon ");

            /* gis toolbar (required) */
            var gisToolbar = $("<div>").gisToolbar().gisToolbar("instance");
            gisToolbar.addClickHandler("#zoom-in-tool", function() {console.log("Zoom in.")});
            /* coordinates overlay (required) */
            var coordinates = $("<div>").coordinateOverlay().coordinateOverlay("instance");
        }
    })
});
