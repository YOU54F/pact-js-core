
#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${0}")"; pwd)" # Figure out where the script is running

node --version
npm --version
PREBUILDIFY_VERSION=6.0.1
NODE_VERSION=$(node -p process.version)
PREBUILD_NAME="node.napi"

apk add bash curl python3 make g++

. "${SCRIPT_DIR}/../lib/export-binary-versions.sh"
"${SCRIPT_DIR}/../lib/download-ffi.sh"
rm -rf build node_modules
npm ci --ignore-scripts
export npm_config_target=${NODE_VERSION}
npx --yes prebuildify@${PREBUILDIFY_VERSION} --napi --libc musl --tag-libc --strip --name ${PREBUILD_NAME}
ls prebuilds/**/*
rm -rf ffi build