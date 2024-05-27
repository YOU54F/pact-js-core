#!/bin/bash -eu
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "${LIB_DIR}/robust-bash.sh"
. "${LIB_DIR}/download-file.sh"

require_binary curl
require_binary gunzip

require_env_var FFI_VERSION

BASEURL=https://github.com/you54f/pact-reference/releases/download
FFI_DIR="${LIB_DIR}/../../ffi"

if [[ $(find "${FFI_DIR}" -name "${FFI_VERSION}*") ]]; then
  log "Skipping download of FFI libraries ${FFI_VERSION}, as they exist"
  exit 0
fi

warn "Cleaning ffi directory $FFI_DIR"
rm -rf "${FFI_DIR:?}"
mkdir -p "$FFI_DIR/osx-x86_64"
mkdir -p "$FFI_DIR/linux-x86_64"
mkdir -p "$FFI_DIR/windows-x86_64"
mkdir -p "$FFI_DIR/osx-aarch64"
mkdir -p "$FFI_DIR/linux-aarch64"

function download_ffi_file {
  if [ -z "${1:-}" ]; then
    error "${FUNCNAME[0]} requires the filename to download"
    exit 1
  fi
  if [ -z "${2:-}" ]; then
    error "${FUNCNAME[0]} requires the output filename to download"
    exit 1
  fi
  FFI_FILENAME="$1"
  OUTPUT_FILENAME="$2"

  URL="${BASEURL}/libpact_ffi-${FFI_VERSION}/${FFI_FILENAME}"
  DOWNLOAD_LOCATION="$FFI_DIR/${OUTPUT_FILENAME}"

  log "Downloading ffi $FFI_VERSION for $FFI_FILENAME"
  download_to "$URL" "$DOWNLOAD_LOCATION"
  debug_log " ... downloaded to '$DOWNLOAD_LOCATION'"
}

function download_ffi {
  if [ -z "${1:-}" ]; then
    error "${FUNCNAME[0]} requires the environment filename suffix"
    exit 1
  fi
  SUFFIX="$1"
  PREFIX="${2:-}"
  OUTPUT_FILENAME="${3:-}"

  download_ffi_file "${PREFIX}pact_ffi-$SUFFIX" "${OUTPUT_FILENAME}"
  debug_log " ... unzipping '$DOWNLOAD_LOCATION'"
  gunzip "$DOWNLOAD_LOCATION"
}

if [[ ${RUNNER_OS:-} == 'Windows' ]]; then
  ONLY_DOWNLOAD_PACT_FOR_WINDOWS=true
fi

if [ -z "${ONLY_DOWNLOAD_PACT_FOR_WINDOWS:-}" ]; then
  download_ffi "linux-x86_64.so.gz" "lib" "linux-x86_64/libpact_ffi.so.gz"
  download_ffi "linux-aarch64.so.gz" "lib" "linux-aarch64/libpact_ffi.so.gz"
  download_ffi "linux-x86_64-musl.a.gz" "lib" "linux-x86_64/libpact_ffi.a.gz"
  download_ffi "linux-aarch64-musl.a.gz" "lib" "linux-aarch64/libpact_ffi.a.gz"
  download_ffi "osx-x86_64.dylib.gz" "lib" "osx-x86_64/libpact_ffi.dylib.gz"
  download_ffi "osx-aarch64-apple-darwin.dylib.gz" "lib" "osx-aarch64/libpact_ffi.dylib.gz"
else
  warn "Skipped download of non-windows FFI libs because ONLY_DOWNLOAD_PACT_FOR_WINDOWS is set"
fi

download_ffi "windows-x86_64.dll.gz" "" "windows-x86_64/pact_ffi.dll.gz"
download_ffi "windows-x86_64.dll.lib.gz" "" "windows-x86_64/pact_ffi.dll.lib.gz"

download_ffi_file "pact.h" "pact.h"
download_ffi_file "pact-cpp.h" "pact-cpp.h"

# Write readme in the ffi folder
cat << EOF > "$FFI_DIR/README.md"
# FFI binaries

This folder is automatically populated during build by /script/download-ffi.sh
EOF
