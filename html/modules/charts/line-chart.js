// This function will get the WCPS query value for all the bands of clicked coordinate
function getQueryResponseAndSetChart(query) {
    $.ajax({
    	type: "get",
    	url: query,
    	success: function(data) {
                var parsedFloats = [];
                parsedFloats = parseFloats(data);
                loadScriptAndCall("", implementChart(parsedFloats));
            }
    });
}


//Implementation function of the graph
    var implementChart = function(floatsArray) {

        //************************************************************
        // Data notice the structure
        //************************************************************
        d3.select("svg").remove();
        var data = [];
        var i = 0,
            j = 0;
        var xDist = 3.0 / floatsArray.length; // Value for setting the equidistance Band wavelength which should be between 1 and 4
        var xPrev = 1.0; // Value used for storing the Band wavelength of the previous Band
        var Ymin = Infinity,
            Ymax = -Infinity; // Values for getting the minimum and maximum out of the array
        /* Adjusting the data so that every single point has a format {'x':__,'y':__} */
        /* Splitting the datasets when 65535 is occured so that points with values 65535 are not ploted*/
        while (i < floatsArray.length) {
            if (floatsArray[i] != 65535) {
                data.push([]);
                while (floatsArray[i] != 65535) {
                    data[j].push({
                        'x': xPrev,
                        'y': floatsArray[i]
                    });
                    if (Ymin > floatsArray[i]) { // Getting the minimum
                        Ymin = floatsArray[i];
                    } else if (Ymax < floatsArray[i]) { // Getting up the minimum
                        Ymax = floatsArray[i];
                    }
                    xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
                    i++;
                }
                j++;
            }
            xPrev = xPrev + xDist; // Setting the correct X-axis wavelength of the current Band/point
            i++;
        }

        /*Different collors for plotting the distinct datasets formed in the above while loop*/
        var colors = ['white'];

        var formatValue = d3.format(",.4f"); // Function to approximate a value
        var bisectXval = d3.bisector(function(d) {
            return d.x;
        }).left;

        //************************************************************
        // Create Margins and Axis and hook our zoom function
        //************************************************************
        var margin = {
                top: 0,
                right: 20,
                bottom: 40,
                left: 60
            },
            width = 620 - margin.left - margin.right,
            height = 310 - margin.top - margin.bottom;

        var innerwidth = width - margin.left - margin.right,
            innerheight = height - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .domain([1.0, 4.0])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([Ymin, Ymax])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(-height)
            .tickPadding(10)
            .tickSubdivide(true)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(-width)
            .tickPadding(10)
            .tickSubdivide(true)
            .orient("left");

        var zoom = d3.behavior.zoom()
            .x(x)
            .y(y)
            .scaleExtent([0.5, (floatsArray.length / 4)]) // 1st value is for zooming out; 2nd is for zooming in
            .on("zoom", zoomed);

        //************************************************************
        // Generate our SVG object
        //************************************************************
        // $('<img>', {id: "ts_image"}).appendTo("#mCSB_3_container")
        var svg = d3.select("#mCSB_3_container").append("svg")
            .call(zoom)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            // .attr("transform", "translate(0," + width + ")")
            .call(yAxis);

        svg.append("g")
            .attr("class", "y axis")
            .append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", (-margin.left) + 10)
            .attr("x", -height / 2)
            .style("text-anchor", "end")
            .text('Reflectance');

        svg.append("g")
            .attr("class", "x axis")
            .append("text")
            .attr("class", "axis-label")
            // .attr("transform", "rotate(-90)")
            .attr("y", 305)
            .attr("x", 235)
            .text('Wavelength (μm)');

        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);


        //************************************************************
        // Create D3 line object and draw data on our SVG object
        //************************************************************
        var line = d3.svg.line()
            .interpolate("linear")
            .x(function(d) {
                return x(d.x);
            })
            .y(function(d) {
                return y(d.y);
            });

        svg.selectAll('.line')
            .data(data)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("clip-path", "url(#clip)")
            .attr('stroke', function(d, i) {
                return colors[i % colors.length];
            })
            .attr("d", line);

        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 4.5);

        focus.append("text")
            .attr("x", 20)
            .attr("dy", ".35em");

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() {
                focus.style("display", null);
            })
            .on("mouseout", function() {
                focus.style("display", "none");
            })
            .on("mousemove", mousemove);

        //************************************************************
        // Draw points on SVG object based on the data given
        //************************************************************
        var points = svg.selectAll('.dots')
            .data(data)
            .enter()
            .append("g")
            .attr("class", "dots")
            .attr("clip-path", "url(#clip)");

        points.selectAll('.dot')
            .data(function(d, index) {
                var a = [];
                d.forEach(function(point, i) {
                    a.push({
                        'index': index,
                        'point': point
                    });
                });
            })
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr("r", 2.5)
            .attr('fill', function(d, i) {
                return colors[d.index % colors.length];
            })
            .attr("transform", function(d) {
                return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")";
            });

        //************************************************************
        // Zoom specific updates
        //************************************************************
        function zoomed() {
            svg.select(".x.axis").call(xAxis);
            svg.select(".y.axis").call(yAxis);
            svg.selectAll('path.line').attr('d', line);

            points.selectAll('circle').attr("transform", function(d) {
                return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")";
            });
        }

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]); // The X value of the exact location of the mouse
            for (var j = 0; j < data.length; j++) { // Iterating over all datasets to locate in which one is x0
                if (x0 >= data[j][0].x && x0 <= data[j][(data[j].length) - 1].x) {
                    var i = bisectXval(data[j], x0, 1); // index for locating point with X value close to the mouse location
                    var d0 = data[j][i - 1];
                    var d1 = data[j][i];
                    var d = x0 - d0.x > d1.x - x0 ? d1 : d0; // d is a point to be shown on the graph
                    focus.attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")");
                    focus.select("text").text("Wavelength: " + formatValue(d.x) + " Reflectance: " + formatValue(d.y));
                }
            }
        }
    }

    // function for loading the graph library //d3js.org/d3.v3.min.js located in the index.html
    var serverResponse = " ";

    function loadScriptAndCall(url, callback) {
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


    function parseFloats(input) {
        var floatsArray = [];
        var helpString = input;

        var parsedFloat = parseFloat(helpString.slice(2, helpString.indexOf(" ")));

        while (helpString.indexOf(" ") != -1) {
            floatsArray.push(parsedFloat);
            helpString = helpString.slice(helpString.indexOf(" ") + 1, helpString.length);
            var parsedFloat = parseFloat(helpString.slice(0, helpString.indexOf(" ")));
        }

        return floatsArray;
    }
