d3.json("./config.json", function(config) {
    console.log(config);

    var parseTime = d3.timeParse(config.dateFormat);
    var numberFormat = d3.format(",.2r");
    var currency = config.currency;
    var startDate = parseTime(config.startDate);
    var endDate = parseTime(config.endDate);
    var deposits = config.deposits;
    var balances = countBalances(deposits);

    var svg = d3.select("svg")
        .attr("class", "axis");

    var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip");

    tooltip
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    var width = +svg.attr("width");
    var middleWidth = width / 2;
    var height = +svg.attr("height");

    var margin = 25;
    var axisHeight = height - 2 * margin;

    var timeScale = createTimeScale(svg, startDate, endDate, axisHeight);
    var valueScale = createValueScale(svg, 400000);

    var oneDayHeight = timeScale(new Date(2000, 1, 2)) - timeScale(new Date(2000, 1, 1))
    console.log("One day height: " + oneDayHeight);

    var line = d3.line()
        .x(function(d) { return valueScale(d.value); })
        .y(function(d) { return timeScale(d.date) + oneDayHeight / 2; });

    // BARS
    svg.selectAll("a")
        .data(deposits)
        .enter()
        .append("rect")
        .attr("class", function(d) { if(d.value >= 0) { return "deposit"; } else { return "debit"; }; })
        .attr("x", function(d) { if(d.value >= 0) { return 1; } else { return -valueScale(Math.abs(d.value)); }; })
        .attr("width", function(d) { return valueScale(Math.abs(d.value)); })
        .attr("y", function(d) { return timeScale(d.date); })
        .attr("height", oneDayHeight - 1)
        .attr("xlink:href", function(d) { if(d.href) { return d.href; } else { return "#"; }; })
        .on("mouseover", function(d) { return tooltip.html(tooltipHtml(d)).style("visibility", "visible");})
        .on("mousemove", function() { return tooltip.style("top", (event.pageY+10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function() { return tooltip.style("visibility", "hidden");})
        .attr("transform", "translate(" + middleWidth + ", " + margin + ")");

    // VALUE CHANGE
    svg.selectAll(".value-change")
        .data(deposits)
        .enter()
        .append("text")
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("x", middleWidth)
        .attr("y", function(d) { return timeScale(d.date) + oneDayHeight / 2; })
        .text(function(d) { return numberFormat(d.value) + " " + currency; })
        .attr("transform", "translate(" + middleWidth + ", " + margin + ")");

    // BALANCE
    svg.append("path")
        .attr("class", "result")
        .style("stroke-dasharray", ("2, 2"))
        .attr("d", line(balances))
        .attr("transform", "translate(" + middleWidth + ", " + margin + ")");

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function createTimeScale(svg, startDate, stopDate, height) {
        var timeScale = d3.scaleTime()
            .domain([startDate, stopDate])
            .range([0, height]);
        var timeAxis = d3.axisRight()
            .scale(timeScale)
            .ticks(10);
        svg.append("g")
            .attr("transform", "translate(" + middleWidth + ", " + margin + ")")
            .call(timeAxis);
        return timeScale;
    }

    function createValueScale(svg, width) {
        var valueScale = d3.scaleLinear()
            .domain([-width, width])
            .range([-middleWidth, middleWidth]);
        var valueAxis = d3.axisTop()
            .scale(valueScale)
            .ticks(10);
        svg.append("g")
            .attr("transform", "translate(" + middleWidth + ", " + margin + ")")
            .call(valueAxis);
        return valueScale;
    }

    function countBalances(deposits) {
        var prev = {"date": startDate, "value": 0, "diff": 0};
        var balances = deposits.flatMap(d => {
            d.date = parseTime(d.date);
            var x = {"date": d.date, "value": prev.value, "diff": 0};
            prev = {"date": d.date, "value": prev.value + d.value, "diff": d.value};
            return [x, prev];
        });
        balances.push({"date": endDate, "value": prev.value, "diff": 0})
        return balances;
    }

    function tooltipHtml(d) {
        if(d.label) {
            return "<strong>" + numberFormat(d.value) + " " + currency + "</strong><hr/>" + d.label;
        } else {
            return "<strong>" + numberFormat(d.value) + " " + currency;
        }
    }
});