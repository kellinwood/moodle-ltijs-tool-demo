#! /bin/bash

set -e
cd $(dirname $0)

docker-compose stop lti-example1
docker-compose rm lti-example1
docker-compose build lti-example1
docker-compose create lti-example1
docker-compose start lti-example1
