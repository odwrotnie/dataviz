d3.json("./config.json", function(config) {
    console.log(config);

    d3.json("../lib/d3-time-format.json", function(error, locale) { // https://unpkg.com/d3-time-format@2/locale/pl-PL.json
        if (error) throw error;

        d3.timeFormatDefaultLocale(locale);

        var parseTime = d3.timeParse(config.dateFormat);
        //var data = config.dataSets;
        var domains = config.domains;
        var startDate = parseTime(config.startDate);
        var endDate = parseTime(config.endDate);
        var yAxisOffset = 40;

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

        domains.forEach( (domain, domainIndex) => { // DOMAINS
            var y = yScaleAndDraw(g.g, domainIndex, g.height, domain.min, domain.max);
            var line = d3.line()
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.value); });
            domain.dataSets.forEach( (ds, dataSetIndex) => {
                g.g.append("path") // PLOT
                    .attr("class", "result")
                    .attr('stroke', color(domainIndex + dataSetIndex))
                    .attr("d", line(ds.values));
            });
        });

        // METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////

        function svgTranslatedG(domainsCount) {
            var svg = d3.select("svg");
            var margin = {top: 20, right: 20, bottom: 30, left: (domainsCount + 1) * 30},
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

        function yScaleAndDraw(g, idx, height, min, max) {
            var y = d3.scaleLinear()
                .domain([min, max])
                .range([height, 0]);
            g.append("g")
                .attr("transform", "translate(-" + (idx * yAxisOffset) + ", 0)")
                .call(d3.axisLeft(y));
            return y;
        }
    });
});