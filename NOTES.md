# Some WIP notes RE: binary sizes

## FFI Binaries

### Sizes pre strip

- https://github.com/pact-foundation/pact-reference/releases/tag/libpact_ffi-v0.4.17

211M    prebuilds

        24M           prebuilds/darwin-arm64/libpact_ffi.dylib
        196K          prebuilds/darwin-arm64/node.napi.node
        26M           prebuilds/darwin-x64/libpact_ffi.dylib
        180K          prebuilds/darwin-x64/node.napi.node
        32M           prebuilds/linux-arm64/libpact_ffi.so
        45M           prebuilds/linux-arm64/node.napi.musl.node
        220K          prebuilds/linux-arm64/node.napi.node
        34M           prebuilds/linux-x64/libpact_ffi.so
        48M           prebuilds/linux-x64/node.napi.musl.node
        204K          prebuilds/linux-x64/node.napi.node

### Sizes with prebuildify strip

With `--strip` option applied in `prebuildify`

- https://github.com/pact-foundation/pact-reference/releases/tag/libpact_ffi-v0.4.17

150M    prebuilds

        ❯ du -sh     prebuilds/*/*
        19M          prebuilds/darwin-arm64/libpact_ffi.dylib
        176K         prebuilds/darwin-arm64/node.napi.node
        22M          prebuilds/darwin-x64/libpact_ffi.dylib
        160K         prebuilds/darwin-x64/node.napi.node
        21M          prebuilds/linux-arm64/libpact_ffi.so
        29M          prebuilds/linux-arm64/node.napi.musl.node
        196K         prebuilds/linux-arm64/node.napi.node
        25M          prebuilds/linux-x64/libpact_ffi.so
        34M          prebuilds/linux-x64/node.napi.musl.node
        180K         prebuilds/linux-x64/node.napi.node

### Sizes with stripped/slimmed binaries from source + prebuildify strip

With `--strip` option applied in `prebuildify`

- https://github.com/YOU54F/pact-reference/releases/tag/libpact_ffi-v0.4.18

 92M    prebuilds

        ❯ du -sh    prebuilds/*/*
        9.5M        prebuilds/darwin-arm64/libpact_ffi.dylib
        176K        prebuilds/darwin-arm64/node.napi.node
        12M         prebuilds/darwin-x64/libpact_ffi.dylib
        160K        prebuilds/darwin-x64/node.napi.node
        11M         prebuilds/linux-arm64/libpact_ffi.so
        21M         prebuilds/linux-arm64/node.napi.musl.node
        196K        prebuilds/linux-arm64/node.napi.node
        14M         prebuilds/linux-x64/libpact_ffi.so
        24M         prebuilds/linux-x64/node.napi.musl.node
        180K        prebuilds/linux-x64/node.napi.node


## NPM Package sizes

Few ways to reduce

- Embed all prebuilds in release
  - Pros:
    - Everything in a single package, for all platforms
    - NPM caching
    - NPM checksums include prebuilds
    - No issues in companies with corp proxies
    - Users can run with `--ignore-scripts`
  - Cons:
    - Adds weight for final package, as contains executables for all architectures/platforms
- Download packages from GitHub Releases via prebuild-install
  - Pros:
    - Smallest package size
    - Users can provide own binaries
  - Cons:
    - Users cannot run with `--ignore-scripts`
    - Need to consider users with proxies
- Download packages from GitHub Releases via custom script
  - Pros:
    - Smallest package size
    - Users can provide own binaries
  - Cons:
    - Users cannot run with `--ignore-scripts`
    - Need to consider users with proxies
- Add architecture/platform specific optional deps
  - Pros:
    - NPM packages contain checksummed binaries
    - Users can opt in to only arch/platforms they will actually use
    - Users can run with `--ignore-scripts`
    - example:- https://github.com/swc-project/swc/blob/40682c8d1f55b42b0a086487e740e975244ed42a/node-swc/src/binding.js#L84
  - Cons:
    - Users need to be aware of optional deps
    - Users may experience bugs
    - Users need to add new platform/arch deps as required
    - bug: https://github.com/npm/cli/issues/4828
      - highest voted open issue on npm https://github.com/npm/cli/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc