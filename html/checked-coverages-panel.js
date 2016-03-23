$(function () {
    $.widget("panel.checkedCoveragePanel", $.dock.panel, {
        options: {
            panelType: "checked-coverage",
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(
                    $("<textarea>", {class: "table-of-coverages"})
                    $("<div>", {class: "table-of-coverages"})
                    $("<table>")
                    $("<tr>")
                    $("<th>No</th>")
                    $("<th>CoverageID</th>")
                    $("<th>Checked</th>")
                    $("<th>View</th>")
                    $("</tr>")
                    $("</thead>")
                    $("</table>")
                    $("</div>")
                )
            ;

        }

        // Template row:
        /*<tr>
          <td>1</td>
          <td>HRL00004839_07_IF182L_TRR3</td>
          <td>
            <input type="checkbox" id="checkedFootPrintsTable_checked_1" value="HRL00004839_07_IF182L_TRR3" onclick="removeCheckedFootPrintRow(this);" checked>
          </td>
          <td>
            <button type="button" class="btn btn-info" id="checkedFootPrintsTable_view_1" data-content="10_39" onclick="viewCheckedFootPrintRow(this);">
                  <span class="glyphicon glyphicon-search"></span> View
            </button>
          </td>
         </tr>*/


        updateCheckedFootPrintsTable = function() {
            var tableContent = "";
            var templateRow = "<tr>" + "<td>$rowNumber</td>" + "<td>$COVERAGE_ID</td>" + "<td>" + " <input type='checkbox' id='checkedFootPrintsTable_checked_$rowNumber' value='$COVERAGE_ID' onclick='removeCheckedFootPrintRow(this);' checked>" + "</td>" + "<td>" + " <button type='button' class='btn btn-info' id='checkedFootPrintsTable_view_$rowNumber' data-content='$LAT_CLICKED_POINT_$LONG_CLICKED_POINT' onclick='viewCheckedFootPrintRow(this);'>" + " <span class='glyphicon glyphicon-search'></span> View" + "</button>" + "</td>" + "</tr>";

            for (i = 0; i < checkedFootPrintsArray.length; i++) {
                var tmp = templateRow.replace("$rowNumber", i + 1);
                tmp = tmp.replaceAll("$COVERAGE_ID", checkedFootPrintsArray[i].coverageID);
                tmp = tmp.replaceAll("$LAT_CLICKED_POINT", checkedFootPrintsArray[i].latClickedPoint);
                tmp = tmp.replaceAll("$LONG_CLICKED_POINT", checkedFootPrintsArray[i].longClickedPoint);

                // add to tableContent
                tableContent = tableContent + tmp;
            }

            // finally, update checkedFootPrintsTable content with tableContent
            $("#checked-coverage").html(tableContent);
        }
    })
});
