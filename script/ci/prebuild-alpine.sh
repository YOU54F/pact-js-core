#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running

node --version
npm --version
PREBUILDIFY_VERSION=5.0.1
apk add bash curl python3 make g++

. "${SCRIPT_DIR}/../lib/export-binary-versions.sh"
"${SCRIPT_DIR}/../lib/download-ffi.sh"
rm -rf build node_modules
npm ci --ignore-scripts
npx --yes prebuildify@${PREBUILDIFY_VERSION} --napi --libc musl --tag-libc
ls prebuilds/**/*
rm -rf ffi build
