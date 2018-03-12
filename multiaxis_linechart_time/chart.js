d3.json("./config.json", function(config) {
    console.log(config);

    d3.json("../lib/d3-time-format.json", function(error, locale) { // https://unpkg.com/d3-time-format@2/locale/pl-PL.json
        if (error) throw error;


        var dotSize = 2;

        d3.timeFormatDefaultLocale(locale);
        var dateTimeFormat = d3.timeFormat(locale.dateTime);

        var parseTime = d3.timeParse(config.dateFormat);
        //var data = config.dataSets;
        var domains = config.domains;
        var startDate = parseTime(config.startDate);
        var endDate = parseTime(config.endDate);
        var yAxisOffset = 60;

        domains.forEach( domain => {
            domain.dataSets.forEach( ds => {
                ds.values.forEach( dv => {
                    dv.date = parseTime(dv.date);
                });
            });
        });

        var g = svgTranslatedG(domains.length);

        var x = xScaleAndDraw(g.g, g.width, g.height);
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var deleteClass = "delete";
        var zoomClass = "zoom";

        var colorIndex = 0;

        domains.forEach((domain, domainIndex) => { // DOMAINS
            var domainName = slugify(domain.name);
            var domainClass = "domain-" + domainName;
            var y = yScaleAndDraw(domainName, g.g, domainIndex, g.height, domain.min, domain.max, zoomClass + " " + domainClass);
            var line = d3.line()
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.value); });
            domain.dataSets.forEach((ds, dataSetIndex) => {
                g.g.append("path") // PLOT
                    .attr("class", zoomClass + " " + domainClass)
                    .attr('stroke', color(colorIndex))
                    .attr("d", line(ds.values));
                g.g.selectAll(domainName)
                    .data(ds.values)
                    .enter()
                    .append("circle")
                    .attr("class", zoomClass + " " + domainClass)
                    .attr("cx", function (d) { return x(d.date); })
                    .attr("cy", function (d) { return y(d.value); })
                    .attr('fill', color(colorIndex++))
                    .attr("r", dotSize)
                    .on("mouseout", function() {
                        //console.log("Mouse out domain: " + domainName);
                        d3.selectAll("." + zoomClass)
                            .transition().duration(1000).attr("opacity", 1);
                        d3.selectAll("." + deleteClass)
                            .remove();
                    })
                    .on("mouseover", function(d) {
                        //console.log("Mouse over domain: " + y());
                        d3.selectAll("." + zoomClass)
                            .transition().duration(100).attr("opacity", 0.15);
                        d3.selectAll("." + domainClass)
                            .transition().duration(100).attr("opacity", 1);
                        g.g.append("text")
                            .text(d.value)
                            .attr("class",  "white " + deleteClass)
                            .attr("alignment-baseline", "central")
                            .attr("transform", "translate(" + (x(d.date) + 5) + ", " + (y(d.value)) + ")");
                        g.g.append("text")
                            .text(dateTimeFormat(d.date))
                            .attr("class", deleteClass)
                            .attr("text-anchor", "end")
                            .attr("alignment-baseline", "central")
                            .attr("transform", "translate(" + (x(d.date) - 5) + ", " + (y(d.value)) + ")");
                        console.log(ds.values);
                        g.g.append("line")
                            .attr("class", "trend " + deleteClass)
                            .attr("x1", x(startDate)).attr("y1", y(ds.values[0].value))
                            .attr("x2", x(endDate)).attr("y2", y(ds.values[ds.values.length - 1].value))
                    });
            });
        });

        // METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////

        function svgTranslatedG(domainsCount) {
            var svg = d3.select("svg");
            var margin = {top: 20, right: 60, bottom: 30, left: (domainsCount * yAxisOffset)},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom;
            var g = svg
                .append("g")
                .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
            return {
                "g": g,
                "width": width,
                "height": height
            };
        }

        function xScaleAndDraw(g, width, height) {
            var x = d3.scaleTime()
                .domain([startDate, endDate])
                .range([0, width]);
            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));
            return x;
        }

        function yScaleAndDraw(domain, g, idx, height, min, max, clazz) {
            var width = Math.abs(max - min);
            var y = d3.scaleLinear()
                .domain([min - 0.03 * width, max + 0.03 * width])
                .range([height, 0]);
            g.append("g")
                .attr("transform", "translate(-" + (idx * yAxisOffset) + ", 0)")
                .attr("class", clazz)
                .call(d3.axisLeft(y));
            g.append("text")
                .text(domain)
                .attr("class", clazz)
                .attr("transform", "translate(" + -(idx * yAxisOffset - 3) + ", 0) rotate(90)");
            return y;
        }

        function slugify(text) {
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')           // Replace spaces with -
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                .replace(/^-+/, '')             // Trim - from start of text
                .replace(/-+$/, '');            // Trim - from end of text
        }
    });
});