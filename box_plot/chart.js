d3.json("./config.json", function(config) {
    console.log("Config:");
    console.log(config);

    var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip");

    tooltip
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    var svg = d3.select("svg");

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    // Set the scales
    var x = d3.scaleLinear()
        .domain([config.min, config.max])
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([-5, 5])
        .range([height, 0]);

    var svg = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    function boxPlot(svg, y, height,
                     xScale, yScale,
                     median,
                     lowerWhisker, upperWhisker,
                     lowerQuartile, upperQuartile) {
        var yOffsetScaled = yScale(y);
        var heightScaled = yScale(0) - yScale(height);
        svg.append("line") // CENTER LINE
            .attr("class", "box")
            .attr("x1", xScale(lowerWhisker))
            .attr("y1", yOffsetScaled)
            .attr("x2", xScale(upperWhisker))
            .attr("y2", yOffsetScaled);
        svg.append("line") // LOWER WHISKER
            .attr("class", "box")
            .attr("x1", xScale(lowerWhisker))
            .attr("y1", yOffsetScaled - heightScaled / 2)
            .attr("x2", xScale(lowerWhisker))
            .attr("y2", yOffsetScaled + heightScaled / 2);
        svg.append("line") // UPPER WHISKER
            .attr("class", "box")
            .attr("x1", xScale(upperWhisker))
            .attr("y1", yOffsetScaled - heightScaled / 2)
            .attr("x2", xScale(upperWhisker))
            .attr("y2", yOffsetScaled + heightScaled / 2);
        svg.append("rect") // BOX
            .attr("class", "box")
            .attr("x", xScale(lowerQuartile))
            .attr("width", xScale(upperQuartile - lowerQuartile))
            .attr("y", yOffsetScaled - heightScaled / 2)
            .attr("height", heightScaled);
        svg.append("line") // MEDIAN
            .attr("class", "box")
            .attr("x1", xScale(config.median))
            .attr("y1", yOffsetScaled - heightScaled / 2)
            .attr("x2", xScale(config.median))
            .attr("y2", yOffsetScaled + heightScaled / 2);
    }

    boxPlot(svg, 0, 2.5,
        x, y,
        config.median,
        config.lowerWhisker, config.upperWhisker,
        config.lowerQuartile, config.upperQuartile);

    // Add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));


});
