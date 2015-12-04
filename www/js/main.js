/**
 * Main JS code for slask
 */
(function () {
    function loadUser(container, nick, uuid) {
        var elem = d3.select(container);
        elem.select('.image').attr('src', "/img/helms/" + nick + ".png");
        elem.select('.nick').text(nick);

        d3.json("/json/stats/minecraft.slaskete.net/json/stats/" + uuid + ".json", function (response) {
            var stats = elem.select(".stats");
            stats[0][0].innerHTML = '';
            var biomes = stats.append("li");
            biomes.append("label").text('Utforsket');
            biomes.append("ul").selectAll("li").data(response['achievement.exploreAllBiomes'].progress).enter().append("li").text(function (explored) { return explored; });
        });
    }
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
            json['played_minutes']['entries'].map(function(d) { played[d.player] = d.value; });
            
            for (var type in json) {
                var data = json[type].entries;
                var title = json[type].title;

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
                    .text(title);

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
                        return "/img/helms/"+d.player+".png";
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
                    var title = lists[list].title;
                    var data = lists[list].entries;
                    var box = node.append('div').classed('box', true);
                    box.append("h2").text(title);

                    var itemElem = box.append('ol').selectAll('li').data(data).enter().append('li');
                    itemElem.append("img").classed("face", true).attr("src", function (item) { return "/img/helms/" + item.player + ".png"; }).attr("title", function (item) { return item.player; }).attr("alt", function (item) { return item.player; });
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
        var menu = d3.select(item.parentNode.parentNode.parentNode);
        menu.selectAll(".selected").classed("selected", false);
        d3.select(item.parentNode).classed("selected", true);
		d3.selectAll(".content>.selected").classed("selected", false);

		var selected = d3.select(item).attr("href");
        var params = selected.split('|');

		d3.select(params[0] + "-container").classed("selected", true);

		if (params[0] == "#toplist")
			loadTopList("#toplist-container");
		if (params[0] == "#graph")
			loadGraphs("#graph-container");
		if (params[0] == "#user")
			loadUser("#user-container", params[1], item.parentNode.getAttribute('data-uuid'));
    }

    /**
     * Update the who is online from minecraft export
     */
    function refreshOnline() {
        d3.json("/slaskete/json/users.json", function (error, online_players) {
            d3.selectAll(".players .player").classed("online", function (elem) {
                return online_players.some(function (player) { return player == elem.name; });
            });
        });
    }
        
    /**
     * Update the chat window from minecraft export
     */
    function refreshChat() {
        d3.json("/slaskete/json/chat.json", function (error, response) {
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
                return "/img/helms/" + encodeURIComponent(item.nick) + ".png" 
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

    function loadPlayerLinks(callback) {
        d3.json("/json/players.json", function(err, players) {
            var cam_accounts = ['Notch', 'ShreeyamGFX', 'Coestar', 'Dinnerbone', 'UelandCam', 'AtillaTari', 'einarcam', 'hildenae', 'sakecam', 'afarberg', 'Hanyu_Furude'];
            players = players.filter(function (elem) {
                return !cam_accounts.some(function (key) {
                    return elem.name == key;
                });    
            });
            var player = d3.select(".players").selectAll(".player").data(players).enter()
                .append("li").classed("player", true);

            var link = player.append("a");
            link.attr("title", function (p) { return p.name; })
                .attr("href", function (p) { return "#user|" + p.name; });
            link.append("img").attr("src", function (p) { return "/img/helms/" + encodeURIComponent(p.name) + ".png"; });

            player.attr("title", function(p) { return p.name; });
            player.attr("data-uuid", function(p) { return p.uuid; });
            callback(players);
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

        var apiUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&key=AIzaSyD2-keFi8faC0wWxzDKuDUH4HpEvE72i74&playlistId=';

        d3.json(apiUrl + encodeURIComponent(feed), function (error, response) {
            if (!response)
                return;
            var latest_eps = d3.select("#latest-episodes");
            var now = new Date();
            for (var i in response.items) {
                var item = response.items[i];
                var videoUrl = 'https://www.youtube.com/watch?v=' + item.contentDetails.videoId;
                var date = new Date(item.snippet.publishedAt);
                var daysOld = (now.getTime() - date.getTime()) / 86400000;
                var video = videos.append('li').classed("video", true);
                dateString = date.toLocaleString();
                video.append('a').attr('href', videoUrl).append('img').classed("thumb", true).attr('src', item.snippet.thumbnails.default.url);
                video.append('div').classed("date", true).text(dateString);
                video.append('a').attr('href', videoUrl).append('span').classed("title", true).text(item.snippet.title);

                if (daysOld < 14) {
                    d3.select(latest_eps.node().parentNode).classed("hidden", false);
                    var latest = latest_eps.append('li').classed("video", true);
                    latest.append('a').attr('href', videoUrl).append('img').classed("thumb", true).attr('src', item.snippet.thumbnails.default.url);
                    latest.append('div').classed("date", true).text(dateString);
                    latest.append('a').attr('href', videoUrl).append('span').classed("title", true).text(item.snippet.title);
                }
            }
        });
    }

    d3.select(window).on("load", function (evt) {
        d3.selectAll(".youtubefeed").each(refreshFeed);

        loadPlayerLinks(function () {
            refreshOnline();
            if (location.hash.substring(0,1) == "#") {
                selectMenuItem(d3.select('.menu a[href="' + location.hash + '"]')[0][0]);
            }
            d3.selectAll(".menu a").on("click", function () {
                selectMenuItem(this);
            });
        });
        setInterval(refreshOnline, 30000);
        setInterval(refreshChat, 30000);
        refreshChat();
    });
})();
