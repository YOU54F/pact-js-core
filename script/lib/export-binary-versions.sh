#!/bin/bash -eu
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
PROJECT_DIR="${LIB_DIR}"/../../

export STANDALONE_VERSION=3.1.2.2-alpha
export FFI_VERSION=v$(grep "PACT_FFI_VERSION = '" "$PROJECT_DIR"/src/ffi/index.ts | grep -E -o "'(.*)'" | cut -d"'" -f2)
