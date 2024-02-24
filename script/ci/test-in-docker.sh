#!/bin/sh -eu
# for arch in arm64; do
#     for version in 3.19 3.18 3.17 3.16 3.15 3.14 3.13;; do
#         rm -rf node_modules
#         docker run -v $PWD:/home -e CIRRUS_CI=true --platform=linux/$arch --rm -it alpine:$version bin/sh -c 'apk add nodejs npm && cd /home && npm ci --ignore-scripts && npm run build && npm test'
#     done
# done


for arch in arm64; do
    for version in 20 18 16; do
        rm -rf node_modules
        docker run -v $PWD:/home \
            -e CIRRUS_CI=true \
            --platform=linux/$arch \
            --rm \
            -it \
            node:$version-alpine \
            bin/sh -c \
            'apk add protoc protobuf-dev && cd /home && npm ci && npm run build && npm test'
            # 'apk add protoc protobuf-dev && cd /home && npm ci --ignore-scripts && npm run build && npm test'
    done
done