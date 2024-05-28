#!/bin/bash -eu
set -e # This needs to be here for windows bash, which doesn't read the #! line above
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh

./script/download-standalone.sh
if [ "${SKIP_PLUGIN_TESTS:-"false"}" != "true" ]; then
    ./script/download-plugins.sh
fi;
./script/ci/build-and-test.sh