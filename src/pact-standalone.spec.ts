import * as fs from 'fs';
import * as path from 'path';
import * as chai from 'chai';
import pactEnvironment from './pact-environment';
import { PactStandalone, standalone } from './pact-standalone';

const { expect } = chai;
const basePath = pactEnvironment.cwd;

// Needs to stay a function and not an arrow function to access mocha 'this' context
(process.env['SKIP_STANDALONE'] === 'true' ? describe.skip : describe)(
  'Pact Standalone',
  function forMocha() {
    // Set timeout to 10 minutes because downloading binaries might take a while.
    this.timeout(600000);

    let pact: PactStandalone;

    it('should return an object with cwd, file and fullPath properties that is platform specific', () => {
      pact = standalone();
      expect(pact).to.be.an('object');
      expect(pact.cwd).to.be.ok;
      expect(pact.brokerPath).to.contain('pact-broker');
      expect(pact.brokerFullPath).to.contain('pact-broker');
      expect(pact.mockServicePath).to.contain('pact-mock-service');
      expect(pact.mockServiceFullPath).to.contain('pact-mock-service');
      expect(pact.stubPath).to.contain('pact-stub-service');
      expect(pact.stubFullPath).to.contain('pact-stub-service');
      expect(pact.verifierPath).to.contain('pact-provider-verifier');
      expect(pact.verifierFullPath).to.contain('pact-provider-verifier');
      expect(pact.pactPath).to.contain('pact');
      expect(pact.pactFullPath).to.contain('pact');
      expect(pact.pactflowPath).to.contain('pactflow');
      expect(pact.pactflowFullPath).to.contain('pactflow');
    });

    it("should return the base directory of the project with 'cwd' (where the package.json file is)", () => {
      expect(fs.existsSync(path.resolve(pact.cwd, 'package.json'))).to.be.true;
    });

    describe('Check if OS specific files are there', () => {
      const tests = [
        ['darwin', 'arm64'],
        ['darwin', 'x64'],
        ['linux', 'arm64'],
        ['linux', 'x64'],
        ['win32', 'x64'],
      ].filter(([platform]) =>
        process.env['ONLY_DOWNLOAD_PACT_FOR_WINDOWS']
          ? platform === 'win32'
          : true
      );

      tests.forEach(([platform, arch]) => {
        describe(`${platform} ${arch}`, () => {
          beforeEach(() => {
            pact = standalone(platform, arch);
          });

          it('broker relative path', () => {
            expect(fs.existsSync(path.resolve(basePath, pact.brokerPath))).to.be
              .true;
          });

          it('broker full path', () => {
            expect(fs.existsSync(pact.brokerFullPath)).to.be.true;
          });

          it('mock service relative path', () => {
            expect(fs.existsSync(path.resolve(basePath, pact.mockServicePath)))
              .to.be.true;
          });

          it('mock service full path', () => {
            expect(fs.existsSync(pact.mockServiceFullPath)).to.be.true;
          });

          it('stub relative path', () => {
            expect(fs.existsSync(path.resolve(basePath, pact.stubPath))).to.be
              .true;
          });

          it('stub full path', () => {
            expect(fs.existsSync(pact.stubFullPath)).to.be.true;
          });

          it('provider verifier relative path', () => {
            expect(fs.existsSync(path.resolve(basePath, pact.verifierPath))).to
              .be.true;
          });

          it('provider verifier full path', () => {
            expect(fs.existsSync(pact.verifierFullPath)).to.be.true;
          });

          it('pact relative path', () => {
            expect(fs.existsSync(path.resolve(basePath, pact.pactPath))).to.be
              .true;
          });

          it('pact full path', () => {
            expect(fs.existsSync(pact.pactFullPath)).to.be.true;
          });

          it('pactflow relative path', () => {
            expect(fs.existsSync(path.resolve(basePath, pact.pactflowPath))).to
              .be.true;
          });

          it('pactflow full path', () => {
            expect(fs.existsSync(pact.pactflowFullPath)).to.be.true;
          });

          if (platform === 'win32') {
            it("should add '.bat' to the end of the binary names", () => {
              expect(pact.brokerPath).to.contain('pact-broker.bat');
              expect(pact.brokerFullPath).to.contain('pact-broker.bat');
              expect(pact.mockServicePath).to.contain('pact-mock-service.bat');
              expect(pact.mockServiceFullPath).to.contain(
                'pact-mock-service.bat'
              );
              expect(pact.stubPath).to.contain('pact-stub-service.bat');
              expect(pact.stubFullPath).to.contain('pact-stub-service.bat');
              expect(pact.verifierPath).to.contain(
                'pact-provider-verifier.bat'
              );
              expect(pact.verifierFullPath).to.contain(
                'pact-provider-verifier.bat'
              );
              expect(pact.pactPath).to.contain('pact.bat');
              expect(pact.pactFullPath).to.contain('pact.bat');
              expect(pact.pactflowPath).to.contain('pactflow.bat');
              expect(pact.pactflowFullPath).to.contain('pactflow.bat');
            });
          }
        });
      });
    });
  }
);
