$(function () {
    $.widget("panel.rgbCombinatorPanel", $.dock.panel, {
        options: {
            panelType: "rgb-combinator"
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(
                    $("<div id='rgbcombinatordiv' style='margin-top:20px;'>" +

			// selected Footprints dropdown
			"<div class='dropdown' id='dropDownSelectedFootPrintsMenu' style='margin-top:20px; margin-left:-20px;'> <button class='btn btn-success dropdown-toggle' style='width:270px;' type='button' data-toggle='dropdown'>Selected Footprints<span class='caret'></span></button> <ul class='dropdown-menu' id='dropDownSelectedFootPrints'> " +
			 "<li> <input type='checkbox' class='checkBoxSelectedFootPrints' data='0' id='checkBoxSelectedFootPrints_0' name='type' value='4' style='margin-left: 10px;'/><a class='menuItem' style='display: inline-block;' href='#' data='0' id='linkSelectedFootPrints_0'><b>***All Selected Footprints***</b></a> <a class='removeMenuItemAll' style='display: inline-block;  margin-left: 15px;' data='0' href='#'><span class='glyphicon glyphicon-remove'></span></a> <li role='separator' class='divider' id='checkBoxSelectedFootPrints_Divider_0'></li>" +
			"</ul></div>" +
			// end selected Footprints dropdown

                                   "<div class='dropdown' style='margin-top:20px;'>"+
                                      "<button class='btn btn-default dropdown-toggle' type='button' id='menu1' data-toggle='dropdown' style='width:270px; margin-left:-20px;'>Coverage Bands<span class='caret'></span></button>"+
                                      "<ul class='dropdown-menu scrollable-menu' role='menu' aria-labelledby='dropdownMenu' id='dropDownRGBBands' data-toggle='dropdown'>"+
                                      "</ul>"+
                                   "</div>"+
                                   "<div class='dropdown' style='margin-top:20px;'>"+
                                      "<button class='btn btn-default dropdown-toggle' type='button' id='menu2' data-toggle='dropdown' style='width:270px; margin-left:-20px;'>WCPS Custom Queries<span class='caret'></span></button>"+
                                      "<ul class='dropdown-menu scrollable-menu ' role='menu' aria-labelledby='dropdownMenu' id='dropDownWCPSBands' data-toggle='dropdown'>"+
                                      "</ul>"+
                                   "</div>"+
                                   "<form class='form-horizontal' role='form' style='margin-top:30px;'>"+
                                      "<div class='form-group'>"+
                                         "<span class='badge' style='background-color:red;'>Red Band</span>"+
                                         "<table>"+
                                            "<tr>"+
                                               "<td><input type='red' class='form-control autocomplete' id='txt_rgb_red' style='width: 170px;' placeholder=''> </td>"+
                                               "<td><button type='button' class='btn btn-warning' id='txt_rgb_red_change' style='margin-left:20px;'>Change</button></td>"+
                                            "</tr>"+
                                         "</table>"+
                                      "</div>"+
                                      "<div class='form-group'>"+
                                         "<span class='badge' style='background-color:green;'>Green Band</span>"+
                                         "<table>"+
                                            "<tr>"+
                                               "<td><input type='green' class='form-control autocomplete' id='txt_rgb_green' style='width: 170px;' placeholder=''> </td>"+
                                               "<td><button type='button' class='btn btn-warning' id='txt_rgb_green_change' style='margin-left:20px;'>Change</button></td>"+
                                            "</tr>"+
                                         "</table>"+
                                      "</div>"+
                                      "<div class='form-group'>"+
                                         "<span class='badge' style='background-color:blue;'>Blue Band</span>"+
                                         "<table>"+
                                            "<tr>"+
                                               "<td><input type='blue' class='form-control autocomplete' id='txt_rgb_blue' style='width: 170px;' placeholder=''> </td>"+
                                               "<td><button type='button' class='btn btn-warning' id='txt_rgb_blue_change' style='margin-left:20px;'>Change</button></td>"+
                                            "</tr>"+
                                         "</table>"+
                                      "</div>"+
                                      "<div class='form-group'>"+
                                         "<div>"+
                                            "<button type='submit' class='btn btn-danger' id='btnSubmitRGBCombination'>Combine</button>"+
                                         "</div>"+
                                      "</div>"+
                                   "</form>" +
                                "</div>"
                    )
                );
        }
    })
});
