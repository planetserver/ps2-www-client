// selected waveLength of product
selectedWaveLengthSpectralLibrary = null;

// selected product value of spectral library
selectedProductValuesSpectralLibrary = null;

var isLoadedAllSpectralLibrary = false;

$(document).ready(function() {

    // list of spectral files in html/data/spectral-chart
    var availableSpectralArray = ["carbonate", "inosil", "meteor", "moon", "nesosil", "nitrates", "oxide", "phosphate", "phylosil", "rocks", "RT_resamp", "sorosil", "sulfate", "synth", "tectosil", "unconsolidated"];
    var JSON_FILE_TEMPLATE = ps2EndPoint + "html/data/spectral-library/$FILENAME.json";

    // store the JSON data for each file json
    var spectralLibraryArray = [];
   
    // Load all the data from spectral library files
    $(function() {
        for (var i = 0; i < availableSpectralArray.length; i++) {
            // closure to get the local variable in each ajax iterator
            (function(i) {
                var jsonFile = JSON_FILE_TEMPLATE.replace("$FILENAME", availableSpectralArray[i]);
                var dataName = availableSpectralArray[i];
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: jsonFile,
                    cache: false,
                    async: true,
                    success: function(data) {
                        var jsonObj = {
                            name: dataName,
                            dataJSON: data
                        };
                        spectralLibraryArray.push(jsonObj);
                        console.log(jsonObj.name);
                    }
                });
            })(i);
        }

        // Then load to category dropdownbox in mainChartDock (this is called after ajax event is finished)
        $(document).ajaxStop(function() {
            if(isLoadedAllSpectralLibrary === false) {
                console.log("Loaded all spectral library.");
                isLoadedAllSpectralLibrary = true;
                // sort the array first
                spectralLibraryArray = spectralLibraryArray.sort(SortByName);
                console.log(spectralLibraryArray);
                // category dropdown in category
                for (var i = 0; i < spectralLibraryArray.length; i++) {
                    var tmp = "<li><a href='#' data-value='$DATA'>$NAME</a></li>";
                    // upper first character
                    tmp = tmp.replace("$DATA", spectralLibraryArray[i].name);
                    tmp = tmp.replace("$NAME", titleCase(spectralLibraryArray[i].name));
                    $("#dropDownCategorySpectralLibrary").append(tmp);
                }
            }
        });
        
    });



    // set selected dropdown box value
    $("#dropDownCategorySpectralLibrary").on('click', 'li a', function() {
        var selectedValue = $(this).data('value');
        $(this).parents(".dropdown").find('.btn').html("Categories: " + $(this).text() + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val(selectedValue);

        // Change the button html of dropDownProoductSpectralLibrary to default
        $("#btnProductSpectralLibrary").html("Spectral Library Products");

        // Load the product dropdown from selected category dropdown
        // clear the content of product dropdown first
        $("#dropDownProductSpectralLibrary").empty();

        // Load all the values for the selected product
        for (var i = 0; i < spectralLibraryArray.length; i++) {
            if (spectralLibraryArray[i].name === selectedValue) {
                //console.log(spectralLibraryArray[i].dataJSON);

                var obj = spectralLibraryArray[i].dataJSON;
                // get all the products of selected value
                for (var key in obj) 
                {
                    if (obj.hasOwnProperty(key))
                    {
                        // Don't add Wavelength to dropdown box
                        if(key === "Wavelength") {
                            // store the value for the wavelength, not add it to dropdown
                            selectedWaveLengthSpectralLibrary = obj[key];
                        } else {
                            var tmp = "<li><a href='#' data-value='$DATA' chart-value='$CHART_VALUE'>$NAME</a></li>";
                            tmp = tmp.replace("$DATA", key);
                            // This array will be used to draw a line chart
                            tmp = tmp.replace("$CHART_VALUE", obj[key]);
                            // upper first character
                            tmp = tmp.replace("$NAME", titleCase(key));                        
                            $("#dropDownProductSpectralLibrary").append(tmp);
                        }                        
                    }
                }
              
                break;
            }
        }
    });

    // product dropdown click
    $("#dropDownProductSpectralLibrary").on('click', 'li a', function() {
        $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));

        // get the chart-value to draw in main chart dock (it is not like {222 33 44} but 222,33,44)
        selectedProductValuesSpectralLibrary = Chart_parseFloatsWithComma($(this).attr('chart-value'));

        // It has values for second line chart, only draw it if the first line from clicked coordinates has values
        if(MainChart_valuesClickedCoordinateArray != null) {
            MainChart_implementChart(MainChart_valuesClickedCoordinateArray, selectedProductValuesSpectralLibrary);
        } else {
            // Change the button html of dropDownProoductSpectralLibrary to default
            $("#btnProductSpectralLibrary").html("Spectral Library Products");
            alert("Please clicked in coverage to draw chart first!");
        }
    });


    function titleCase(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function SortByName(a, b) {
        var aName = a.name.toLowerCase();
        var bName = b.name.toLowerCase();
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }

});
