#! /bin/bash

set -e
cd $(dirname $0)

if [[ $# != 1 ]]; then
    echo "USAGE:   startup_phase2.sh <tool service name>"
    echo "EXAMPLE: startup_phase2.sh lti-tool1"
    exit 1
fi

service=$1

docker-compose stop ${service}
docker-compose rm --force ${service}
docker-compose build ${service}
docker-compose create ${service}
docker-compose start ${service}
