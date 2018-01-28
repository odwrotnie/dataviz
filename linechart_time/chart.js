d3.json("./config.json", function(config) {
    console.log(config);

    var parseTime = d3.timeParse(config.dateFormat);
    var data = config.data;
    var startDate = parseTime(config.startDate);
    var endDate = parseTime(config.endDate);

    data.sortBy(d => {
        return d.date;
    });
    data.forEach(d => {
        d.date = parseTime(d.date);
    });

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
    var x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([0, 5])
        .range([height, 0]);

    // Append the svg object to the body of the page
    // Append a 'group' element to 'svg'
    // Moves the 'group' element to the top left margin
    var svg = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });
    svg.append("path")
        //.style("stroke-dasharray", ("2, 2"))
        .attr("d", line(data))
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    // Add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
});
