var d3Vis = function (container) {
    if (document.querySelector(container).children.length != 0)
        return;

    var margin = {top: 50, right: 20, bottom: 75, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10, "");



    d3.json("json/stats/top_lists.json", function (error, json) {
        var getValue = function(d) {
            return d.value;
        }

        var played = {}
        json['played_minutes'].map(function(d) { played[d.player] = d.value; });
        

        for (var type in json) {
            var data = json[type];

            var svg = d3.select(container).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            x.domain(data.map(function(d) { return d.player; }));
            y.domain([0, d3.max(data, function(d) { return getValue(d); })]);


            // X-Axis //

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
            .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .style('font-size', '12px')
                .attr("transform", function(d) {
                    return "rotate(-65)" 
                    });

            // Y-axis
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", width/2)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(type);


            /* The bars */
            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr('rx', 3)
                .attr('ry', 3)
                .attr("x", function(d) { return x(d.player); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return height; })
                .attr("height", function(d) { return 0; })
                .transition().delay(function (d,i){ return 300;})
                .duration(1000)
                .attr("y", function(d) { return y(getValue(d)); })
                .attr("height", function(d) { return height - y(getValue(d)); });

            /* Bar text */
            svg.selectAll("text.score")
                .data(data)
                .enter().append("text")
                .attr("x", function(d) { return x(d.player); })
                .attr("y", function(d) { return y(getValue(d)) })
                .attr("dx", (width/data.length)*0.2)
                .attr("dy", (width/data.length)*0.4)
                .attr("fill", "white")
                .style('font-size', '12px')
                .text(function(d) { return getValue(d)});


            /* avatars */
            svg.selectAll("image")
                .data(data)
                .enter().append("image")
                .attr("x", function(d) { return x(d.player); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return height; })
                .attr("height", function(d) { return 0; })
                .attr("xlink:href", function(d) {
                    return "https://minotar.net/helm/"+d.player+"/32";
                })
                .transition().delay(function (d,i){ return 300;})
                .duration(1000)
                .attr("height", x.rangeBand())
                .attr("y", function(d) { return y(getValue(d))-x.rangeBand(); })
            }
        })
    };
