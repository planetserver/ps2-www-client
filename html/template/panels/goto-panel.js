$(function () {
    $.widget("panel.goToPanel", $.dock.panel, {
        options: {
            panelType: "goto"
        },
        _create: function () {
            this._super();
            this.panelBody
                .append(
                    $("<div id='gotoPanel' style='float: background-color: rgba(47, 85, 151, .2); '>"+
                      "<table style='border-spacing: 10px; border-collapse: separate; width: 400px; color: white;'>"+
			"<tr> <td> <button id='btnGoto' type='button' class='btn btn-success' style='height: 20px; font-size: 10px;'>Goto</button> </td>" + " <td colspan='2'> <input type='text' id ='txtGoto' style='color:blue; font-size:12px;'/>" +
			 " <td style='color: blue;'> <select id='dropdownGoto'> <option value='region'>Region</option> <option value='coverageID'>Footprint ID</option> <option value='latlon'>Lat,Lon</option> </select> </td> </tr>" +
                      "</table>"+
		       "<a href='#' id='linkGoTo' style='color:yellow; font-size:9px;'></a>" +
                    "</div>"
                    )
                );
        }
    })
});
