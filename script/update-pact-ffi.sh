#!/bin/sh

set -e

: "${1?Please supply the pact-ffi version to upgrade to}"

FFI_VERSION=$1

cat src/ffi/index.ts | sed "s/export const PACT_FFI_VERSION.*/export const PACT_FFI_VERSION = '${FFI_VERSION}';/" > tmp-install
mv tmp-install src/ffi/index.ts