#!/bin/bash

# echo $NODE_PRE_GYP_GITHUB_TOKEN
mkdir -p bindings
mkdir -p bindings_dist
platform="osx"
for arch in arm64 amd64; do 
    for version in 14 16 18 19; do 
        docker build . \
            --build-arg=NODE_VERSION=$version \
            --build-arg=NODE_PRE_GYP_GITHUB_TOKEN \
            -t pact-$platform-$arch-$version \
            --platform=linux/$arch
        docker create --name extract pact-$platform-$arch-$version
        docker cp extract:/app/lib ./bindings/pact-$platform-$arch-$version
        docker cp extract:/app/build/stage ./bindings_dist/pact-$platform-$arch-$version
        docker rm extract
    done
done