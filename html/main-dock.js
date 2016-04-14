$(function () {
    $.widget("dock.mainDock", $.earthserver.dock, {
        options: {
            position: "left",
            toggleIcon: "glyphicon glyphicon-menu-hamburger",
            projections: true,
            baseMaps: true,
            queryTerminal: true
        },
        /* Initializes the main dock and by default creates
            the projections, the coverages and the query terminal panels */
        _create: function () {
            this._super();
            this.dockToggleIconWrapper
                .append(
                    $("<span>", {class: this.options.toggleIcon + " dock-toggle-icon"})//, "data-step":"1", "data-intro":"bububububu"
                );
            if(this.options.projections) {
                this.addProjectionSelectPanel();
            }
            if(this.options.baseMaps) {
                this.addAvailableBaseMapsPanel();
            }
            if(this.options.queryTerminal) {
                this.addQueryTerminalPanel();
            }
        },

	// Projections Panel
        addProjectionSelectPanel: function () {
            this.projectionSelectPanel = $("<div>").selectPanel({
                dock: this.dock,
                panelId: "projection-selector",
                panelTitle: "projections",
                dropdownId: "projectionDropdown"
            }).selectPanel("instance");

            var self = this;
            $.each(projectionNames, function (index, projection) {
                if (index == 0) {
                    self.projectionSelectPanel.setButtonContent(projection);
                }
                self.projectionSelectPanel.addSelectOption(projection.replace(/ /g, '').toLowerCase(), projection);
            });
            return this;
        },
        /*getProjectionSelectPanel: function() {
            return this.projectionSelectPanel;
        },*/

	// Base Maps Panel
        addAvailableBaseMapsPanel: function() {
            this.baseMapsSelectPanel = $("<div>").selectPanel({
                dock: this.dock,
                panelId: "basemaps-selector",
                panelTitle: "available Base maps",
                dropdownId: "basemapsDropdown"
            }).selectPanel("instance");

            var self = this;
            $.each(baseMapNames, function (index, basemap) {
		if (index == 0) {
                     self.baseMapsSelectPanel.setButtonContent(basemap);
                }
                self.baseMapsSelectPanel.addSelectOption(basemap.replace(/ /g, '').toLowerCase(), basemap);
            });
            return this;
        },
        addQueryTerminalPanel: function() {
            this.queryTerminalPanel = $("<div>").queryTerminalPanel({
                dock: this.dock,
                panelId: "query-terminal",
                panelTitle: "wcps query"
            }).queryTerminalPanel("instance");

            return this;
        },
        addCheckedCoveragesPanel: function() {
          // this.checkedCoveragesPanel = $("<div>").checkedCoveragesPanel({
          //     dock: this.dock,
          //     panelId: "checked-coverages",
          //     panelTitle: "selected coverages"
          // }).checkedCoveragesPanel("instance");
          //
          // return this;
      },

      // RGB Panels
      addRgbCombinatorPanel: function() {
        this.rgbCombinatorPanel = $("<div>").rgbCombinatorPanel({
            dock: this.dock,
            panelId: "rgb-combinator",
            panelTitle: "rgb combinator"
        }).checkedCoveragesPanel("instance");

        return this;
    }
    })
});
