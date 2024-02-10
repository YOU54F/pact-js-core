#!/bin/sh -eu

rm -rf node_modules
docker run -v $PWD:/home -e CIRRUS_CI=true --platform=linux/amd64 --rm -it node:alpine bin/sh -c 'apk add bash curl python3 make g++ && cd /home && /home/script/ci/prebuild-alpine.sh && npm run build && npm test'
rm -rf node_modules
docker run -v $PWD:/home -e CIRRUS_CI=true --platform=linux/arm64 --rm -it node:alpine bin/sh -c 'apk add bash curl python3 make g++ && cd /home && /home/script/ci/prebuild-alpine.sh && npm run build && npm test'
