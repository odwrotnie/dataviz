d3.json("./config.json", function(config) {
    console.log(config);

    var svg = d3.select("svg")
        .attr("class", "axis");

    var width = +svg.attr("width");
    var height = +svg.attr("height");

    var margin = 25;
    var axisHeight = height - 2 * margin;

    var orderScale = createOrderScale(svg, axisHeight);
    var valueScale = createValueScale(svg, 1000);

    // BARS
    svg.selectAll("a")
        .data(config.bets)
        .enter()
        .append("rect")
        //.attr("class", function(d) { if(d.value >= 0) { return "deposit"; } else { return "debit"; }; })
        .attr("x", 0)
        .attr("width", valueScale(100))
        .attr("y", function(d) { return orderScale(d.date); })
        .attr("height", oneDayHeight - 1)
        .attr("xlink:href", function(d) { if(d.href) { return d.href; } else { return "#"; }; })
        .on("mouseover", function(d) { return tooltip.html(tooltipHtml(d)).style("visibility", "visible");})
        .on("mousemove", function() { return tooltip.style("top", (event.pageY+10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function() { return tooltip.style("visibility", "hidden");})
        .attr("transform", "translate(" + middleWidth + ", " + margin + ")");

    // // VALUE CHANGE
    // svg.selectAll(".value-change")
    //     .data(deposits)
    //     .enter()
    //     .append("text")
    //     .attr("text-anchor", "end")
    //     .attr("alignment-baseline", "middle")
    //     .attr("x", middleWidth)
    //     .attr("y", function(d) { return orderScale(d.date) + oneDayHeight / 2; })
    //     .text(function(d) { return numberFormat(d.value) + " " + currency; })
    //     .attr("transform", "translate(" + middleWidth + ", " + margin + ")");

    // // BALANCE
    // svg.append("path")
    //     .attr("class", "result")
    //     .style("stroke-dasharray", ("2, 2"))
    //     .attr("d", line(balances))
    //     .attr("transform", "translate(" + middleWidth + ", " + margin + ")");

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function createOrderScale(svg, height, count) {
        var orderScale = d3.scaleLinear()
            .domain([1, count])
            .range([0, height]);
        var orderAxis = d3.axisRight()
            .scale(orderScale)
            .ticks(10);
        svg.append("g")
            .attr("transform", "translate(" + margin + ", " + margin + ")")
            .call(orderAxis);
        return orderScale;
    }

    function createValueScale(svg, width) {
        var valueScale = d3.scaleLinear()
            .domain([0, width])
            .range([0, width]);
        var valueAxis = d3.axisTop()
            .scale(valueScale)
            .ticks(10);
        svg.append("g")
            .attr("transform", "translate(" + margin + ", " + margin + ")")
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