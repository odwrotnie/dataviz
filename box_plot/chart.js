d3.json("./config.json", function(config) {
    console.log("Config:");
    console.log(config);

    var svg = d3.select("svg");

    var MIN = Math.min(config.min, config.lowerWhisker);
    var MAX = Math.max(config.max, config.upperWhisker);

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    // Set the scales
    var x = d3.scaleLinear()
        .domain([MIN, MAX])
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([-1, 1])
        .range([height, 0]);

    var svg = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    function boxPlot(svg, y, height,
                     xScale, yScale,
                     median,
                     lowerWhisker, upperWhisker,
                     lowerQuartile, upperQuartile,
                     outliers) {

        if (median < lowerQuartile) throw "median < lowerQuartile";
        if (median > upperQuartile) throw "median > upperQuartile";
        if (lowerWhisker > lowerQuartile) throw "lowerWhisker > lowerQuartile";
        if (lowerQuartile > upperWhisker) throw "lowerQuartile > upperWhisker";

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
            .attr("width", xScale(upperQuartile) - xScale(lowerQuartile))
            .attr("y", yOffsetScaled - heightScaled / 2)
            .attr("height", heightScaled);
        svg.append("line") // MEDIAN
            .attr("class", "box")
            .attr("x1", xScale(config.median))
            .attr("y1", yOffsetScaled - heightScaled / 2)
            .attr("x2", xScale(config.median))
            .attr("y2", yOffsetScaled + heightScaled / 2);
        svg.selectAll("circle") // OUTLIERS
            .data(outliers)
            .enter()
            .append("circle")
            .attr("class", "box-outlier")
            .attr("cx", function (d) { return xScale(d); })
            .attr("cy", function (d) { return yScale(0); })
            .attr("r", function (d) { return 2; });
    }

    boxPlot(svg, 0, 1,
        x, y,
        config.median,
        config.lowerWhisker, config.upperWhisker,
        config.lowerQuartile, config.upperQuartile,
        config.outliers);

    // Add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the y Axis
    // svg.append("g")
    //     .call(d3.axisLeft(y));
});
