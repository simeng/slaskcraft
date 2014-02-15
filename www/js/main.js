/**
 * Main JS code for slask
 */
(function () {
    function loadGraphs(container) {
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
    /**
     * Load top stats from top_lists.json
     */
    function loadTopList(id) {
        if (document.querySelector(id).children.length == 0) {
            d3.json("json/stats/top_lists.json", function (error, lists) {
                var node = d3.select(id);
                for (var list in lists) {
                    var box = node.append('div').classed('box', true);
                    box.append("h2").text(list);

                    var itemElem = box.append('ol').selectAll('li').data(lists[list]).enter().append('li');
                    itemElem.append("img").classed("face", true).attr("src", function (item) { return "https://minotar.net/helm/" + item.player + "/16"; }).attr("title", function (item) { return item.player; }).attr("alt", function (item) { return item.player; });
                    itemElem.append("span").classed("player", true).text(function(item) { return item.player; });
                    itemElem.append("span").classed("value", true).text(function(item) { return item.value; });
                }
            });
        }
    }

    /**
     * Show page containers when selecting menu items
     */
    function selectMenuItem(item) {
        var menu = d3.select(item.parentNode.parentNode);
        menu.selectAll(".selected").classed("selected", false);
        d3.select(item.parentNode).classed("selected", true);
		d3.selectAll(".content>.selected").classed("selected", false);

		var selected = d3.select(item).attr("href");
		d3.select(selected + "-container").classed("selected", true);

		if (selected == "#toplist")
			loadTopList("#toplist-container");
		if (selected == "#graph")
			loadGraphs("#graph-container");
    }

    /**
     * Update the who is online from minecraft export
     */
    function refreshOnline() {
        d3.json("http://minecraft.slaskete.net/json/users.json", function (error, response) {
            var online = d3.select(".chat .online");
            var user = online.selectAll(".user").data(response).enter().append('li').classed('user', true).classed('none', function (nick) { return nick == 'Ingen'; });
            user.append('img').classed("face", true).attr("src", function (nick) { return "https://minotar.net/helm/" + encodeURIComponent(nick) + "/32"; }).attr("title", function (nick) { return nick; }).attr("alt", function (nick) { return nick; });
        });
    }
        
    /**
     * Update the chat window from minecraft export
     */
    function refreshChat() {
        d3.json("http://minecraft.slaskete.net/json/chat.json", function (error, response) {
            var lines = d3.select(".chat .lines").selectAll('li');
            lines = lines.data(response.filter(function (item) {
                return item.action != 'new_day' && 
                    item.action != 'said' && 
                    item.action != 'action';
            })).enter().append('li');

            lines.attr("class", function (item, i) { 
                return item.action ? "line " + item.action : "line"; 
            });

            var id = lines.append("div");
            id.classed("id", true);

            id.append('div').classed("timestamp", true).text(function (item) { 
                return item.timestamp; 
            });

            id.append('img').classed("face", true).attr("src", function (item) {
                return "https://minotar.net/helm/" + encodeURIComponent(item.nick) + "/16" 
            });

            id.append('span').classed("nick", true).text(function (item) { 
                return item.nick 
            });
            
            lines.filter(function (item) { 
                return item.action == 'gained'; 
            }).append('div').classed("achievement", true).text(function (item) {
                return item.message; 
            });

            lines.filter(function (item) { 
                return item.action != 'gained' && 
                    item.action != 'join' && 
                    item.action != 'leave'; 
            }).append('div').classed("message", true).text(function (item) { 
                return item.message; 
            });
        });
    }

    /**
     * Load video feeds from youtube
     */
    function refreshFeed() {
        var videos = d3.select(this);
        var feed = videos.attr("data-id");
        if (!feed)
            return;

        d3.json("http://gdata.youtube.com/feeds/api/playlists/" + encodeURIComponent(feed) + "?v=2&alt=json&orderby=published&max-results=10", function (error, response) {
            var latest_eps = d3.select("#latest-episodes");
            var now = new Date();
            for (var i in response.feed.entry) {
                var item = response.feed.entry[i];
                var date = new Date(item.published.$t);
                var daysOld = (now.getTime() - date.getTime()) / 86400000;
                var video = videos.append('li').classed("video", true);
                dateString = date.toLocaleString();
                video.append('a').attr('href', item.media$group.media$player.url).append('img').classed("thumb", true).attr('src', item.media$group.media$thumbnail[0].url);
                video.append('div').classed("date", true).text(dateString);
                video.append('a').attr('href', item.media$group.media$player.url).append('span').classed("title", true).text(item.title.$t);

                if (daysOld < 14) {
                    d3.select(latest_eps.node().parentNode).classed("hidden", false);
                    var latest = latest_eps.append('li').classed("video", true);
                    latest.append('a').attr('href', item.media$group.media$player.url).append('img').classed("thumb", true).attr('src', item.media$group.media$thumbnail[0].url);
                    latest.append('div').classed("date", true).text(dateString);
                    latest.append('a').attr('href', item.media$group.media$player.url).append('span').classed("title", true).text(item.title.$t);
                }
            }
        });
    }

    d3.select(window).on("load", function (evt) {
        d3.selectAll(".menu a").on("click", function (evt) {
            selectMenuItem(this);
        });
        if (location.hash.substring(0,1) == "#") 
            selectMenuItem(d3.select('.menu a[href="' + location.hash + '"]')[0][0]);
        d3.selectAll(".youtubefeed").each(refreshFeed);

        setInterval(refreshOnline, 30000);
        setInterval(refreshChat, 30000);
        refreshOnline();
        refreshChat();
    });
})();
