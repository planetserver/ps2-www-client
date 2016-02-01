
	/*left menu opening function*/
$(document).ready(function () {
	$('#menu-toggle').click(function() {
		if($('#menu').hasClass('open')) {
			$('#menu').removeClass('open');
			$('#menu-toggle').removeClass('open');
		}
		else {
			$('#menu').addClass('open');
			$('#menu-toggle').addClass('open');
		}
	});
});

	/*right menu opening function*/
$(document).ready(function () {
	$('#right-menu-toggle').click(function() {
		if($('#right-menu').hasClass('open')) {
			$('#right-menu').removeClass('open');
			$('#right-menu-toggle').removeClass('open');
		}
		else {
			$('#right-menu').addClass('open');
			$('#right-menu-toggle').addClass('open');
		}
	});
});

	/*right menu opening function*/
$(document).ready(function () {
	$('#right-layer-menu-toggle').click(function() {
		if($('#right-layer-menu').hasClass('open')) {
			$('#right-layer-menu').removeClass('open');
			$('#right-layer-menu-toggle').removeClass('open');
		}
		// else {
		// 	$('#right-layer-menu').addClass('open');
		// 	$('#right-layer-menu-toggle').addClass('open');
		// }
	});
});

// fetching information from github documentation and filling the about menu
var xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://raw.githubusercontent.com/planetserver/ps2-documentation/master/about.md", true);
xhttp.send();
xhttp.onreadystatechange = function() {
  if (xhttp.readyState == 4 && xhttp.status == 200) {
    document.getElementById("collapse1").innerHTML = xhttp.responseText;
  }
};

//Implementation function of the graph
var implementChart = function() {

	//margin and positioning
	var margin = {top: 40, right: 40, bottom: 40, left: 40},
	    width = 360 - margin.left - margin.right,
	    height = 360 - margin.top - margin.bottom;

	var formatDate = d3.time.format("%d-%b-%y");

	var x = d3.time.scale()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var line = d3.svg.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.close); });

	var svg = d3.select("#right-layer-menu").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.tsv("js/example_data.tsv", type, function(error, data) {
	  if (error) throw error;

	  x.domain(d3.extent(data, function(d) { return d.date; }));
	  y.domain(d3.extent(data, function(d) { return d.close; }));

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Price ($)");

	  svg.append("path")
	      .datum(data)
	      .attr("class", "line")
	      .attr("d", line);
	});

	function type(d) {
	  d.date = formatDate.parse(d.date);
	  d.close = +d.close;
	  return d;
	}
};

// function for loading the graph library //d3js.org/d3.v3.min.js located in the index.html 
function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

loadScript("//d3js.org/d3.v3.min.js", implementChart);




  
