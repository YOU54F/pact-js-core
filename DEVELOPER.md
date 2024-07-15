# Developer documentation

Pact-Js-Core uses FFI bindings from the pact-reference project, which are prebuilt for end users, the following steps will show some of the steps required to build and test locally on your machine.

Do this and you should be 👌👌👌:

```
bash script/ci/prebuild.sh
# Alternatively, you can download the latest github release prebuilds from the pact-js-core project
FETCH_ASSETS=true ./script/ci/check-release-libs.sh --fetch-assets -t v15.1.0
# Make os/arch specific npm packages, with newly created prebuilds
make all
npm ci --ignore-scripts
# Link os/arch specific npm package, for running os/arch system
make link
# Update main package.json optional dependencies versions, with those created earlier
make update_opt_deps
npm run build
npm test
```

_notes_ - 

As a developer, you need to run `bash script/ci/prebuild.sh` to

- download the FFI libraries to `ffi` folder
- prebuilds the binaries and outputs to `prebuilds`
- cleans up `ffi` and `build`

For end users, the following is provided as part of the packaging and release step in CI.

- the `prebuilds` folder containing built `ffi` bindings
- the `binding.gyp` file is removed from the npm package, so `npm install` doesn't attempt to build the `ffi` buildings, that are prebuilt.

If you have a `binding.gyp` file, and have created `prebuilds` you will want to perform `npm ci` or `npm install` with `--ignore-scripts` set, to avoid building the `ffi` which is prebuilt.

Alternatively you can run the following, which will not create a prebuild, but instead use `node-gyp` to output the built `ffi` libraries to the `build` folder. This was the previous method, which meant that end users would also perform.

```
bash script/download-libs.sh
npm ci
npm run build
npm test
```

### Linux x86_64 Task

#### Pre Reqs

1. x86_64 Machine
   1. ARM64 Mac - If you have Rosetta (MacOS)

### CI Locally

1. Docker/Podman
2. Act

```sh
act --container-architecture linux/amd64 -W .github/workflows/build-and-test.yml --artifact-server-path tmp
```
