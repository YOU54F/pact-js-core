import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { libName } from '.';

const { expect } = chai;
chai.use(chaiAsPromised);

describe('ffi names', () => {
  it('has the correct name for windows intel', () => {
    expect(libName('pact_ffi', 'v0.0.1', 'x64', 'win32')).to.be.equal(
      'v0.0.1-pact_ffi-windows-x86_64.dll'
    );
  });
  it('has the correct name for windows arm', () => {
    expect(libName('pact_ffi', 'v0.0.1', 'arm64', 'win32')).to.be.equal(
      'v0.0.1-pact_ffi-windows-aarch64.dll'
    );
  });
  it('has the correct name for linux intel', () => {
    expect(libName('pact_ffi', 'v0.0.1', 'x64', 'linux')).to.be.equal(
      'v0.0.1-libpact_ffi-linux-x86_64.so'
    );
  });
  it('has the correct name for linux arm', () => {
    expect(libName('pact_ffi', 'v0.0.1', 'arm64', 'linux')).to.be.equal(
      'v0.0.1-libpact_ffi-linux-aarch64.so'
    );
  });
  it('has the correct name for osx intel', () => {
    expect(libName('pact_ffi', 'v0.0.1', 'x64', 'darwin')).to.be.equal(
      'v0.0.1-libpact_ffi-osx-x86_64.dylib'
    );
  });
  it('has the correct name for osx arm', () => {
    expect(libName('pact_ffi', 'v0.0.1', 'arm64', 'darwin')).to.be.equal(
      'v0.0.1-libpact_ffi-osx-aarch64.dylib'
    );
  });
});
