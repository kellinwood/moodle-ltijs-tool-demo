#! /bin/bash

set -e
dirs="mariadb_data mongodb_data moodle_data moodledata_data lti-example1/node_modules"

for dir in ${dirs}; do
    rm -rf $dir
done
