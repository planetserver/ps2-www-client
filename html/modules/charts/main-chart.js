// This function will get the WCPS query value for all the bands of clicked coordinate
valuesClickedCoordinateArrayMainChart = null;

// All the obj for line charts are stored (not for the spectral library)
// store the data provider for multiple charts
dataProviderChartsArrayMainChart = [];

// Number of line charts and spectral library
lineChartsCountMainChart = { count: 0 };

// All the obj for spectral library charts (not for clicked chart)
spectralLibrarydataProviderChartsArrayMainChart = [];

// This array has all objects for drawing chart with default range charts (i.e: 1-4 in wavelength)
var defaultCombinedArrayChartsMainChart = [];

// check if a line chart is drawn
var isAddedALineChartMainChart = { isDrawn: false };

// store the clicked coordinates to add the place markers
placeMarkersArray = [];

// Handle change event of range charts text box (only after drawing chart)
$('#txtRangeChartsMainChart').keypress(function (e) {
    var key = e.which;
    if (key == 13)  // the enter key code
    {
        Chart_filterRangeCharts("MainChart", defaultCombinedArrayChartsMainChart, dataProviderChartsArrayMainChart, selectedProductValuesSpectralLibraryMainChart, spectralLibrarydataProviderChartsArrayMainChart);
    }
});


$(function() {
    // clear all the drawn charts, with the spectral library charts
    $("#btnClearChartsMainChart").click(function() {
        if (!isAddedALineChartMainChart.isDrawn) {
            alert("Please click on a footprint to retrieve the spectra first!");
            return;
        }

        // If a line chart is drawn
        var ret = confirm("Do you want to remove all charts?");
        if (ret) {

            // clear all the spectral library charts (selected color from <li> of selected category and product)
            for (var i = 0; i < selectedSpectralLibraryArrayMainChart.length; i++) {
                var productID = selectedSpectralLibraryArrayMainChart[i];
                var categoryID = productID.split("_")[0];

                $("#" + categoryID).css("background-color", "white");
                $("#" + productID).css("background-color", "white");
            }

            // then clear this selected color array
            selectedSpectralLibraryArrayMainChart = [];

            // remove the data provider array for clicked charts
            dataProviderChartsArrayMainChart = [];

            // remove the data provider array for spectral library charts
            spectralLibrarydataProviderChartsArrayMainChart = [];

            // remove all the clicked drawn charts
            isAddedALineChartMainChart.isDrawn = false;

            // remove the place marker array
            placeMarkersArray = [];

            // remove the drawn line charts by remove all the data, and the spectral line charts
            valuesClickedCoordinateArrayMainChart = null;
            selectedProductValuesSpectralLibraryMainChart = null;

            // clear all the drawn line charts here
            Chart_drawChart([], "MainChartDiv", dataProviderChartsArrayMainChart, selectedProductValuesSpectralLibraryMainChart, spectralLibrarydataProviderChartsArrayMainChart);

            // clear all the clicked points
            placemarkLayer.removeAllRenderables();
        }
    });

});


// WCPS query and get data for line chart
function MainChart_getQueryResponseAndSetChart(query) {

    // Only when add chart is selected
    if ($("#radioBtnAddChartMainChart").is(':checked')) {
        if (lineChartsCountMainChart.count > MAXIMUM_LINECHARTS + MAXIMUM_SPECTRAL_LIBRARY_CHARTS) {
            alert("Maximum clicked line charts is: " + MAXIMUM_LINECHARTS  + ", maximum spectral library charts is: " + MAXIMUM_SPECTRAL_LIBRARY_CHARTS);
            return;
        }
    }

    // Get values for clicked chart
    $.ajax({
        type: "get",
        url: query,
        success: function(data) {
            valuesClickedCoordinateArrayMainChart = Chart_parseFloats(data);

            // only click on the footprint to get values from coordinate (these parameters from main-chart and spectral-library file)
            Chart_implementChart(false, valuesClickedCoordinateArrayMainChart, selectedProductValuesSpectralLibraryMainChart, "MainChart", selectedWaveLengthSpectralLibraryArrayMainChart, dataProviderChartsArrayMainChart, spectralLibrarydataProviderChartsArrayMainChart, defaultCombinedArrayChartsMainChart, dataProviderChartsArrayMainChart, selectedProductValuesSpectralLibraryMainChart, lineChartsCountMainChart, isAddedALineChartMainChart);
        }
    });
}


function PlaceMarkerConstructor(latitude, longitude, iconPath) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.iconPath = iconPath;
}

// When select product library, it will call function implement chart to draw spectral library charts with clicked coordinate chart
function MainChart_implementSpectralLibraryChart(isChangeSpectralLibrary, floatsArray, spectralFloatsArray) {
    Chart_implementChart(isChangeSpectralLibrary, floatsArray, spectralFloatsArray, "MainChart", selectedWaveLengthSpectralLibraryArrayMainChart, dataProviderChartsArrayMainChart, spectralLibrarydataProviderChartsArrayMainChart, defaultCombinedArrayChartsMainChart, dataProviderChartsArrayMainChart, selectedProductValuesSpectralLibraryMainChart, lineChartsCountMainChart, isAddedALineChartMainChart);
}