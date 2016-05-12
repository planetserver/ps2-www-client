$(function () {
    $.widget("panel.goToPanel", $.dock.panel, {
        options: {
            panelType: "goto"
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(
                    $("<div id='gotoPanel' style='float: right;background-color: rgba(47, 85, 151, .2);'>"+
                      "<table style='border-spacing: 10px; border-collapse: separate; width: 400px; color: white;'>"+
                        //"<tr> <td colspan='3' style='font-size:10px;'> Please choose Region or Coverage Name or (Latitude and Longitude) to navigate on globe.</td> </tr>"+
                        "<tr> <td>Region: </td> <td colspan='2'> <input type='text' id='txtRegionGoTo' class='autocompleteRegionGoTo' style='width:81%; color:blue; font-size:12px;'/> <button id='btnRegionGoTo' type='button' class='btn btn-success' style='height: 20px; font-size: 10px;'>Goto</button> </td> </tr>"+
                        "<tr> <td>Product Id: </td> <td colspan='2'> <input type='text' id='txtCoverageIDGoTo' class='autocompleteCoverageIDGoTo' style='width:81%; color:blue; font-size:12px;'/> <button id='btnCoverageIDGoTo' type='button' class='btn btn-warning' style='height: 20px; font-size: 10px;'>Goto</button> </td> </tr>"+
                        "<tr> <td>Latitude: </td> <td colspan='2'> <input type='text' id='txtLatitudeGoTo' style='width:25%; color:blue; font-size:12px;'/>"+
                             "&nbsp; Longitude: &nbsp; "+
                                 "<input type='text' id='txtLongitudeGoTo' style='width:26%; color:blue; font-size:12px;'/> "+
                             "<button id='btnLatLonGoTo' type='button' class='btn btn-danger' style='height: 20px; font-size: 10px;'>Goto</button>"+
                             "</td> </tr>"+
                        "<tr> <td colspan='3'> <a href='#' id='linkGoTo' style='color:yellow; font-size:9px;'></a></tr>"+
                      "</table>"+
                    "</div>"
                    )
                );
        }
    })
});
