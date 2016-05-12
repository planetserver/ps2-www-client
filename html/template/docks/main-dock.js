/***
* This file is used to add the panels on the left menu and has many panels (main-dock.js)
* and later on can be called in service.js by function add*Panel (e.g: addAvailableBaseMapsPanel)
* And main-dock.js also need to call function from file *-panel.js (e.g: select-panel.js)
* then inside each "add panels" function below, it can initialize the object of panel-function above (e.g: $("<div>").selectPanel({... )
* So from 1 widget selectPanel (drop down box), it can be used to create many other drop down boxex with their own data.
* (e.g: addProjectionSelectPanel() will use projectionNames array as data
     and addAvailableBaseMapsPanel() will use baseMapNames array as data)
***/
$(function() {
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
        _create: function() {
            this._super();
            this.dockToggleIconWrapper
                .append(
                    $("<span>", {
                        class: this.options.toggleIcon + " dock-toggle-icon"
                    }) //, "data-step":"1", "data-intro":"bububububu"
                );
            if (this.options.projections) {
                this.addProjectionSelectPanel();
            }
            if (this.options.baseMaps) {
                this.addAvailableBaseMapsPanel();
            }
            if (this.options.queryTerminal) {
                this.addQueryTerminalPanel();
            }
        },

        // Projections Panel
	// selectPanel is select-panel.js
        addProjectionSelectPanel: function() {
            this.projectionSelectPanel = $("<div>").selectPanel({
                dock: this.dock,
                panelId: "projection-selector",
                panelTitle: "projections",
                dropdownId: "projectionDropdown"
            }).selectPanel("instance");

            var self = this;

            // projectionNames from selection-names.js
            $.each(projectionNames, function(index, projection) {
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
	// selectPanel is select-panel.js
        addAvailableBaseMapsPanel: function() {
            this.baseMapsSelectPanel = $("<div>").selectPanel({
                dock: this.dock,
                panelId: "basemaps-selector",
                panelTitle: "available Base maps",
                dropdownId: "basemapsDropdown"
            }).selectPanel("instance");

            var self = this;

            // baseMapNames from selection-panel.js
            $.each(baseMapNames, function(index, basemap) {
                if (index == 0) {
                    self.baseMapsSelectPanel.setButtonContent(basemap);
                }
                self.baseMapsSelectPanel.addSelectOption(basemap.replace(/ /g, '').toLowerCase(), basemap);
            });
            return this;
        },

	// queryTerminalPanel from query-terminal-panel.js
        addQueryTerminalPanel: function() {
            // this.queryTerminalPanel = $("<div>").queryTerminalPanel({
            //     dock: this.dock,
            //     panelId: "query-terminal",
            //     panelTitle: "wcps query"
            // }).queryTerminalPanel("instance");
            //
            // return this;
        },

        //GoTO pannel
        addGoToPanel: function() {
            this.goToPanel = $("<div>").goToPanel({
                dock: this.dock,
                panelId: "goTo",
                panelTitle: "search location"
            });
            return this;
          },

        // RGB Panels
	// So first create a file .js which contains widget name (e.g: $.widget("panel.rgbCombinatorPanel", $.dock.panel))
	// here is rgb-combinator-panel.js

        addRgbCombinatorPanel: function() {
            this.rgbCombinatorPanel = $("<div>").rgbCombinatorPanel({
                dock: this.dock,
                panelId: "rgb-combinator",
                panelTitle: "rgb combinator"
            });

            return this;
        }
    })
});
