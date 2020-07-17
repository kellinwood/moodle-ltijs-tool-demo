#! /bin/bash

set -e
dirs="mariadb_data mongodb_data moodle_data moodledata_data"

for dir in ${dirs}; do
    rm -rf $dir
done
