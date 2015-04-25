#!/usr/bin/env python
# :vim:set noet:ts=4:

import json
import os
import urllib2
import md5

steve_digest = "RJGwCWa0JfbvXSM3i2P4eg=="
base_dir = os.path.dirname(__file__)

def update_avatar(nick):
    url = "https://minotar.net/helm/%s/32" % ( nick )
    print "Fetching %s" % ( url )
    try:
        avatar = urllib2.urlopen(url).read()
        filename = "../www/img/helms/%s.png" % ( nick )
        print "Writing %s" % ( filename )
        digest = md5.new(avatar).digest()
        if digest.encode("base64").find(steve_digest) == 0:
            print "Not saving Steve-avatar"
        else:
            open(os.path.join(base_dir, filename), "w+").write(avatar)
    except urllib2.HTTPError, e:
        print e.msg

def get_current_nick(uuid):
    try:
        jsondata = urllib2.urlopen("https://api.mojang.com/user/profiles/" + uuid + "/names").read()
        names = json.loads(jsondata)
        return names[-1]['name']
    except urllib2.HTTPError, e:
        print e.msg

players = json.loads(open(os.path.join(base_dir, "../www/json/stats/minecraft.slaskete.net/json/stats/whitelist.json")).read())

new_player_nicks = []

for player in players:
    update_avatar(player['name'])
    new_player_nicks.append({'uuid': player['uuid'], 'name': get_current_nick(player['uuid'].replace("-", ""))})

open(os.path.join(base_dir, "../www/json/players.json"), "w+").write(json.dumps(new_player_nicks))

