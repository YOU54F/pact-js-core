#!/bin/bash -eu

docker run -v $PWD:/home --platform linux/arm64 --rm node:20-alpine /bin/sh -c 'apk add bash && cd /home && bash ./script/ci/prebuild-alpine.sh && rm -rf ffi node_modules'
docker run -v $PWD:/home --platform linux/amd64 --rm node:20-alpine /bin/sh -c 'apk add bash && cd /home && bash ./script/ci/prebuild-alpine.sh && rm -rf ffi node_modules'
docker run --platform=linux/arm64 --rm -it -v $PWD:/home node:20 bash -c 'apt update --yes && apt install --yes curl python3 make build-essential g++ unzip zip git && cd home && ./script/ci/prebuild.sh'
docker run --platform=linux/amd64 --rm -it -v $PWD:/home node:20 bash -c 'apt update --yes && apt install --yes curl python3 make build-essential g++ unzip zip git && cd home && ./script/ci/prebuild.sh'