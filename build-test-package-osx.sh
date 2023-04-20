#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ - ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"


arch=$(uname -m)
platform="osx"
for version in 14 16 18 19; do 
    uname -m
    rm -rf lib build ffi node_modules
    script/download-libs.sh
    nvm install $version
    nvm use $version
    node -e 'console.log(process.arch)'
    npm install --build-from-source
    npm run build
    npm test
    ./node_modules/.bin/node-pre-gyp rebuild
    ./node_modules/.bin/node-pre-gyp package
    ./node_modules/.bin/node-pre-gyp-github publish
    mkdir -p ./bindings/pact-$platform-$arch-$version
    mv lib ./bindings/pact-$platform-$arch-$version
    mkdir -p bindings_dist/pact-$platform-$arch-$version
    mv build/stage/* ./bindings_dist/pact-$platform-$arch-$version
    nvm deactivate
    nvm uninstall $version
done