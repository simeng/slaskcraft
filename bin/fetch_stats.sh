#!/bin/bash
BASE=`dirname $0`

if [ ! -d $BASE/../www/json/stats/ ]; then
    mkdir $BASE/../www/json/stats/ || exit "Error making $BASE/../www/json/stats/"
fi

cd $BASE/../www/json/stats/
wget -q -r --no-parent --reject "index.html*" 'http://minecraft.slaskete.net/json/stats/'

if [ ! -e archive/allplayers-`date -d yesterday +%Y-%m-%d`.json ]; then
	cp -a allplayers.json archive/allplayers-`date -d yesterday +%Y-%m-%d`.json
fi

tempfile="allplayers.json.tmp"
echo "{" > $tempfile
for i in minecraft.slaskete.net/json/stats/*.json
do
	player="`basename $i`"
	player="${player/.json/}"

	echo "    \"$player\":" >> $tempfile
	cat $i >> $tempfile
	echo >> $tempfile
	echo "," >> $tempfile
done

( head -n -1 $tempfile ; echo "}" ) > allplayers.json

cd - >/dev/null
cd $BASE
python top10.py
