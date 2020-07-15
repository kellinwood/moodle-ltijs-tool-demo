#! /bin/bash

set -e

cd $(dirname $0)

data_dirs="mariadb_data mongodb_data moodle_data moodledata_data"
for dir in $dirs; do
    if [ ! -d $dir ]; then
	mkdir $dir
    fi
done

docker-compose up --no-start
docker-compose start chrome mariadb mongodb moodle
