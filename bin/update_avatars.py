#!/usr/bin/env python
# :vim:set noet:ts=4:

import json
import os
import urllib2

base_dir = os.path.dirname(__file__)

players = json.loads(open(os.path.join(base_dir, "../www/json/stats/minecraft.slaskete.net/json/stats/whitelist.json")).read())

for player in players:
    nick = player['name']
    url = "https://minotar.net/helm/%s/32" % ( nick )
    print "Fetching %s" % ( url )
    try:
        avatar = urllib2.urlopen(url).read()
        filename = "../www/img/helms/%s.png" % ( nick )
        print "Writing %s" % ( filename )
        open(os.path.join(base_dir, filename), "w+").write(avatar)
    except urllib2.HTTPError, e:
        print e.msg

