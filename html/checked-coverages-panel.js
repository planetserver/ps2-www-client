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
                        "<h2> Checked table </h2><table class='table" +
                        " table-bordered'><thead><tr><th>No</th><th>CoverageID</th><th>Checked</th><th>View</th></tr></thead>" +
                        "<tbody id='checkedFootPrintsTable'></tbody></table></div>"
                    )
                );
        }
    })
});
