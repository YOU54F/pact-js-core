#!/bin/bash -e
set -e # Windows bash does not read the #! line above

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../../lib/robust-bash.sh

require_env_var NODE_AUTH_TOKEN

set +x #Don't echo the NPM key

NPMRC_FILE=.npmrc
echo  "@@you54f:registry=https://registry.npmjs.org/" > $NPMRC_FILE
echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" >> $NPMRC_FILE
echo "//registry.npmjs.org/:username=@you54f" >> $NPMRC_FILE
echo "//registry.npmjs.org/:email=you54f@saf.dev" >> $NPMRC_FILE
echo "//registry.npmjs.org/:always-auth=true" >> $NPMRC_FILE

set -x
