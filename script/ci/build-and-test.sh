#!/bin/bash -eu
set -e # This needs to be here for windows bash, which doesn't read the #! line above
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh

if [[ ${SET_NVM:-} == 'true' && "$(uname -s)" == 'Darwin' ]]; then
  NVM_DIR=${NVM_DIR:-"$HOME/.nvm"}
  . $(brew --prefix nvm)/nvm.sh # Load nvm
  nvm install $NODE_VERSION
  nvm use $NODE_VERSION
elif [[ ${SET_NVM:-} == 'true' && "$(uname -s)" == 'Linux' ]]; then
  NVM_DIR=${NVM_DIR:-"$HOME/.nvm"}
  . $NVM_DIR/nvm.sh # Load nvm
  nvm install $NODE_VERSION
  nvm use $NODE_VERSION
fi

node --version
npm --version
# if [[ ${CI:-} == 'true' && "$(uname -s)" == 'Linux' && "$(uname -m)" == 'aarch64' && "$(node --version)" == *18* ]]; then
# # npm ERR! code ECONNRESET
# # npm ERR! errno ECONNRESET
# # npm ERR! network request to https://registry.npmjs.org/ failed, reason: Client network socket disconnected before secure TLS connection was established
#   npm config set maxsockets 1
# fi
# if [[ ${CI:-} == 'true' && "$(uname -s)" == 'Linux' && "$(uname -m)" == 'aarch64' && "$(node --version)" == *16* ]]; then
#   # Setting the cache location is a workaround for node 16 install errors https://github.com/npm/cli/issues/5114
#   npm config set cache /tmp
# fi
npm ci --ignore-scripts --maxsockets 1 

npm run format:check
npm run lint
npm run build
npm run test
ls -1