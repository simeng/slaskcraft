#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim: set noet:ts=4:

import json
import os
import random

base_dir = os.path.dirname(__file__)

def get_top_list(players, stat_key):
	occurances = {}

	for uuid, player in players.items():
		if uuid == 'whitelist' or uuid not in players['whitelist']:
			continue
		name = players['whitelist'][uuid]['name']
        for k, v in player.items():
            if k.find(stat_key) == 0:
                if not name in occurances:
                    occurances[name] = 0
                occurances[name] += players[uuid][k]

	occurances_sorted = sorted(occurances, key=occurances.__getitem__, reverse=True)

	return [{"player": key, "value": occurances[key]} for key in occurances_sorted]

players = json.loads(open(os.path.join(base_dir, "../www/json/stats/allplayers.json")).read())

cam_accounts = ['Notch', 'ShreeyamGFX', 'Coestar', 'Dinnerbone', 'UelandCam', 'AtillaTari', 'einarcam', 'hildenae', 'sakecam', 'afarberg', 'Hanyu_Furude'];

uuid_indexed_players = {}
for p in players['whitelist']:
	if p['name'] not in cam_accounts:
		uuid_indexed_players[p['uuid']] = p

players['whitelist'] = uuid_indexed_players

top_list = {
	"deaths": {
        "title": "Dødd",
        "entries": get_top_list(players, "stat.deaths")
    },
	"jumps": {
        "title": "Hoppet",
        "entries": get_top_list(players, "stat.jump")
    },
	"player_kills": {
        "title": "Drept andre",
        "entries": get_top_list(players, "stat.playerKills")
    },
	"enderman_kills": {
        "title": "Drepte Endermenn",
        "entries": get_top_list(players, "stat.killEntity.Enderman")
    },
	"played_minutes": {
        "title": "Spilletid (min)",
        "entries": get_top_list(players, "stat.playOneMinute")
    },
	"damage_taken": {
        "title": "Skade motatt",
        "entries": get_top_list(players, "stat.damageTaken")
    },
	"mined_diamond_ore": {
        "title": "Diamanter utgravd",
        "entries": get_top_list(players, "stat.mineBlock.minecraft.diamond_ore")
    },
	"mined_obsidian": {
        "title": "Obsidian utgravd",
        "entries": get_top_list(players, "stat.mineBlock.minecraft.obsidian")
    },
	"damage_dealt": {
        "title": "Skade gjort",
        "entries": get_top_list(players, "stat.damageDealt")
    },
	"treasure_fished": {
        "title": "Fiskede skatter",
        "entries": get_top_list(players, "stat.treasureFished")
    },
	"bats_killed": {
        "title": "Flaggermus drept",
        "entries": get_top_list(players, "stat.killEntity.Bat")
    },
	"mined_lapis_ore": {
        "title": "Lapis utgravd",
        "entries": get_top_list(players, "stat.mineBlock.minecraft.lapis_ore")
    },
	"blocks_mined": {
        "title": "Blokker utgravd",
        "entries": get_top_list(players, "stat.mineBlock.")
    },
	"items_crafted": {
        "title": "Ting bygget",
        "entries": get_top_list(players, "stat.craftItem.")
    },
	"fallen_cm": {
        "title": "Falt (cm)",
        "entries": get_top_list(players, "stat.fallOneCm")
    },
	"dive_cm": {
        "title": "Dykket (cm)",
        "entries": get_top_list(players, "stat.diveOneCm")
    },
	"villager_trades": {
        "title": "Handlet med landsbyborgere",
        "entries": get_top_list(players, "stat.tradedWithVillager")
    },
	"time_since_death": {
        "title": "Tid siden død (eller start)",
        "entries": get_top_list(players, "stat.timeSinceDeath")
    }
}

non_cam_players = [player for player in players if 'stat.craftItem.58' in players[player]]
random.shuffle(non_cam_players)

open(os.path.join(base_dir, "../www/json/players.json"), "w+").write(json.dumps(non_cam_players))

open(os.path.join(base_dir, "../www/json/stats/top_lists.json"), "w+").write(json.dumps(top_list))
