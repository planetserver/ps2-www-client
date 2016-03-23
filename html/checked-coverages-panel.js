$(function () {
    $.widget("panel.checkedCoveragesPanel", $.dock.panel, {
        options: {
            panelType: "checked-coverages"
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(
                    $("<div id='checkedFootPrintsDiv'>" +
                        "<table class='table" +
                        " table-bordered'><thead><tr><th>CoverageID</th><th>Active</th><th>View</th></tr></thead>" +
                        "<tbody id='checkedFootPrintsTable'></tbody></table></div>"
                    )
                );
        }
    })
});
