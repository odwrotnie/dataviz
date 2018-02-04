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
        .domain([0, 5])
        .range([height, 0]);

    var svg = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    svg.append("rect")
        .attr("class", "box")
        .attr("x", x(config.lowerQuartile))
        .attr("y", y(4))
        .attr("width", x(config.upperQuartile - config.lowerQuartile))
        .attr("height", y(3));

    // var line = d3.line()
    //     .x(function(d) { return x(d.date); })
    //     .y(function(d) { return y(d.value); });
    // data.forEach( (ds, idx) => {
    //     svg.append("path")
    //         .attr("class", "result")
    //         .attr('stroke', color(idx))
    //         .attr("d", line(ds.values));
    // });
    //
    // // Add the x Axis
    // svg.append("g")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(d3.axisBottom(x));
    //
    // // Add the y Axis
    // svg.append("g")
    //     .call(d3.axisLeft(y));
});
