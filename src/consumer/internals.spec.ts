import type { Ffi } from '../ffi/types';
import logger from '../logger';
import { mockServerMismatches, reifyMessage } from './internals';

describe('internals', () => {
  const originalPactCrash = logger.pactCrash;

  beforeEach(() => {
    logger.pactCrash = () => {};
  });

  afterEach(() => {
    logger.pactCrash = originalPactCrash;
  });

  describe('#mockServerMismatches', () => {
    it('parses the mismatches from the core', () => {
      const ffi = {
        pactffiMockServerMismatches: () =>
          JSON.stringify([
            {
              type: 'request-mismatch',
              mismatches: ['{"type":"QueryMismatch"}'],
            },
          ]),
      } as unknown as Ffi;

      expect(mockServerMismatches(ffi, 1234)).toEqual([
        { type: 'request-mismatch', mismatches: [{ type: 'QueryMismatch' }] },
      ]);
    });

    it('throws a clear error when the core returns no mismatches', () => {
      const ffi = {
        pactffiMockServerMismatches: () => null,
      } as unknown as Ffi;

      expect(() => mockServerMismatches(ffi, 1234)).toThrow(
        /mismatches for the mock server on port 1234/,
      );
    });
  });

  describe('#reifyMessage', () => {
    it('returns the reified message', () => {
      const ffi = {
        pactffiMessageReify: () => '{"contents":"a"}',
      } as unknown as Ffi;

      expect(reifyMessage(ffi, 1)).toBe('{"contents":"a"}');
    });

    it('throws a clear error when the core returns no message', () => {
      const ffi = { pactffiMessageReify: () => null } as unknown as Ffi;

      expect(() => reifyMessage(ffi, 1)).toThrow(/unable to reify the message/);
    });
  });
});
