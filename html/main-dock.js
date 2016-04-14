$(function () {
    $.widget("dock.mainDock", $.earthserver.dock, {
        options: {
            position: "left",
            toggleIcon: "glyphicon glyphicon-menu-hamburger",
            projections: true,
            coverages: true,
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
            if(this.options.coverages) {
                this.addAvailableCoveragesPanel();
            }
            if(this.options.queryTerminal) {
                this.addQueryTerminalPanel();
            }
        },
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
        getProjectionSelectPanel: function() {
            return this.projectionSelectPanel;
        },
        addAvailableCoveragesPanel: function() {
            this.coverageSelectPanel = $("<div>").selectPanel({
                dock: this.dock,
                panelId: "coverage-selector",
                panelTitle: "available Base maps",
                buttonId: "coverageDropdown",
                defaultOption: "Select Base Map"
            }).selectPanel("instance");

            var self = this;
            $.each(coverageNames, function (index, coverage) {
                self.coverageSelectPanel.addSelectOption(coverage.replace(/ /g, '').toLowerCase(), coverage);
            });
            this.coverageSelectPanel.addButton("retrieve-coverage", "Retrieve");

            return this;
        },
        getAvailableCoveragesPanel: function() {
            return this.coverageSelectPanel;
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
