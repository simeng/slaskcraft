#!/usr/bin/env python

import json
import os
import random

base_dir = os.path.dirname(__file__)

def get_top_list(players, stat_key):
	occurances = {}

	for player in players:
		if stat_key in players[player]:
			occurances[player] = players[player][stat_key]

	occurances_sorted = sorted(occurances, key=occurances.__getitem__, reverse=True)

	return [{"player": key, "value": occurances[key]} for key in occurances_sorted]


players = json.loads(open(os.path.join(base_dir, "../www/json/stats/allplayers.json")).read())

top_list = {
	"deaths": get_top_list(players, "stat.deaths"),
	"jumps": get_top_list(players, "stat.jump"),
	"player_kills": get_top_list(players, "stat.playerKills"),
	"played_minutes": get_top_list(players, "stat.playOneMinute"),
	"damage_taken": get_top_list(players, "stat.damageTaken"),
	"mined_diamond_ore": get_top_list(players, "stat.mineBlock.56"),
	"mined_lapis_ore": get_top_list(players, "stat.mineBlock.21")
}

non_cam_players = [player for player in players if 'stat.craftItem.58' in players[player]]
random.shuffle(non_cam_players)

open(os.path.join(base_dir, "../www/json/players.json"), "w+").write(json.dumps(non_cam_players))

open(os.path.join(base_dir, "../www/json/stats/top_lists.json"), "w+").write(json.dumps(top_list))
