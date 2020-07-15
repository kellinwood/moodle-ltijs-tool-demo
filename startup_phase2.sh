#! /bin/bash

set -e
cd $(dirname $0)

docker-compose stop lti-tool1
docker-compose rm --force lti-tool1
docker-compose build lti-tool1
docker-compose create lti-tool1
docker-compose start lti-tool1
