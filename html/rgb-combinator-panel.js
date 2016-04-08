$(function () {
    $.widget("panel.rgbCombinatorPanel", $.dock.panel, {
        options: {
            panelType: "rgb-combinator"
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(
                    $("<div id='rgbcombinatordiv'>"+
                             "<button type='button' class='btn btn-danger' id='btnClearAllSelectedFootPrints' style='margin-top:-20px;'>UnCheck All</button>"+
                             "<select class='form-control' name='color' id='comboBoxSelectedFootPrints'>"+
                                      "<option value=''>Selected Footprints</option>"+
                                   "</select>"+
                                   "<div class='dropdown'>"+
                                      "<button class='btn btn-default dropdown-toggle' type='button' id='menu1' data-toggle='dropdown' style='width:200px;'>Coverage Bands<span class='caret'></span></button>"+
                                      "<ul class='dropdown-menu scrollable-menu' role='menu' aria-labelledby='dropdownMenu' id='dropDownRGBBands' data-toggle='dropdown'>"+
                                      "</ul>"+
                                   "</div>"+
                                   "<div class='dropdown'>"+
                                      "<button class='btn btn-default dropdown-toggle' type='button' id='menu2' data-toggle='dropdown' style='width:200px;'>WCPS custom queries<span class='caret'></span></button>"+
                                      "<ul class='dropdown-menu scrollable-menu ' role='menu' aria-labelledby='dropdownMenu' id='dropDownWCPSBands' data-toggle='dropdown'>"+
                                      "</ul>"+
                                   "</div>"+
                                   "<form class='form-horizontal' role='form' style='margin-top:10px;'>"+
                                      "<div class='form-group'>"+
                                         "<span class='badge' style='background-color:red;'>Red Band</span>"+
                                         "<table>"+
                                            "<tr>"+
                                               "<td><input type='red' class='form-control' id='txt_rgb_red' placeholder=''> </td>"+
                                               "<td><button type='button' class='btn btn-warning' id='txt_rgb_red_change' style='margin-left:20px;'>Change</button></td>"+
                                            "</tr>"+
                                         "</table>"+
                                      "</div>"+
                                      "<div class='form-group'>"+
                                         "<span class='badge' style='background-color:green;'>Green Band</span>"+
                                         "<table>"+
                                            "<tr>"+
                                               "<td><input type='green' class='form-control' id='txt_rgb_green' placeholder=''> </td>"+
                                               "<td><button type='button' class='btn btn-warning' id='txt_rgb_green_change' style='margin-left:20px;'>Change</button></td>"+
                                            "</tr>"+
                                         "</table>"+
                                      "</div>"+
                                      "<div class='form-group'>"+
                                         "<span class='badge' style='background-color:blue;'>Blue Band</span>"+
                                         "<table>"+
                                            "<tr>"+
                                               "<td><input type='blue' class='form-control' id='txt_rgb_blue' placeholder=''> </td>"+
                                               "<td><button type='button' class='btn btn-warning' id='txt_rgb_blue_change' style='margin-left:20px;'>Change</button></td>"+
                                            "</tr>"+
                                         "</table>"+
                                      "</div>"+
                                      "<div class='form-group'>"+
                                         "<div>"+
                                            "<button type='submit' class='btn btn-default' id='btnSubmitRGBCombination'>Submit</button>"+
                                         "</div>"+
                                      "</div>"+
                                   "</form>"+
                                "</div>"
                    )
                );
        }
    })
});
