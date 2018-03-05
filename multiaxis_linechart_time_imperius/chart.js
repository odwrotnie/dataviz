d3.json("./config.json", function(config) {
    console.log(config);

    var startDate = _.chain(config.results)
        .map((v) => new Date(v.timestamp)).min().value();
    console.log(startDate);

    var endDate = _.chain(config.results)
        .map((v) => new Date(v.timestamp)).max().value();
    console.log(endDate);

    var domains = _.chain(config.results)
        .filter(v => v.count !== 0)
        .groupBy(v => v.parameter.name)
        .map((values, name) => ({
            "name": name,
            "min": (_.chain(values).map((v) => v.avg).min((v) => v).value()),
            "max": (_.chain(values).map((v) => v.avg).max((v) => v).value()),
            "dataSets": [{
                "name": name,
                "values": (_.chain(values).map((v) => ({
                    "value": v.avg,
                    "date": new Date(v.timestamp)
                })).value()),
                "correlation": [0, 0]
            }]
        }))
        .value();

    console.log(domains);

    d3.json("../lib/d3-time-format.json", function(error, locale) { // https://unpkg.com/d3-time-format@2/locale/pl-PL.json
        if (error) throw error;


        var dotSize = 2;

        d3.timeFormatDefaultLocale(locale);
        var dateTimeFormat = d3.timeFormat(locale.dateTime);

        var yAxisOffset = 60;

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
            domain.dataSets.forEach( (ds, dataSetIndex) => {
                g.g.append("path") // PLOT
                    .attr("class", zoomClass + " " + domainClass)
                    .attr('stroke', color(colorIndex))
                    .attr("d", line(ds.values));
                g.g.selectAll(domainName)
                    .data(ds.values)
                    .enter()
                    .append("circle")
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
                            .transition().duration(100).attr("opacity", 0.3);
                        d3.selectAll("." + domainClass)
                            .transition().duration(100).attr("opacity", 1);
                        g.g.append("text")
                            .text(d.value)
                            .attr("class", deleteClass)
                            .attr("alignment-baseline", "central")
                            .attr("transform", "translate(" + (x(d.date) + 5) + ", " + (y(d.value)) + ")");
                        g.g.append("text")
                            .text(dateTimeFormat(d.date))
                            .attr("class", deleteClass)
                            .attr("text-anchor", "end")
                            .attr("alignment-baseline", "central")
                            .attr("transform", "translate(" + (x(d.date) - 5) + ", " + (y(d.value)) + ")");
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
            var y = d3.scaleLinear()
                .domain([min, max])
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