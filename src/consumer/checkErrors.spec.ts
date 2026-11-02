import logger from '../logger';
import { wrapAllWithResultCheck, wrapWithCheck } from './checkErrors';

describe('checkErrors', () => {
  const originalPactCrash = logger.pactCrash;

  afterEach(() => {
    logger.pactCrash = originalPactCrash;
  });

  it('treats numeric status code 0 as success', () => {
    let called = false;
    logger.pactCrash = () => {
      called = true;
    };

    const wrapped = wrapWithCheck(() => 0, 'num');

    const result = wrapped();
    expect(result).toBe(0);
    expect(called).toBe(false);
  });

  it('treats non-zero numeric status as failure', () => {
    let called = false;
    logger.pactCrash = () => {
      called = true;
    };

    const wrapped = wrapWithCheck(() => 1, 'num');

    const result = wrapped();
    expect(result).toBe(1);
    expect(called).toBe(true);
  });

  describe('wrapAllWithResultCheck', () => {
    it('checks status results and returns other results unchanged', () => {
      const crashes: string[] = [];
      logger.pactCrash = (message: string) => {
        crashes.push(message);
      };
      const contents = Buffer.from('contents');

      const wrapped = wrapAllWithResultCheck({
        given: () => false,
        setKey: () => true,
        reifyMessage: () => '{"a":1}',
        getRequestContents: () => contents,
        withMetadata: () => undefined,
      });

      expect(wrapped.given()).toBe(false);
      expect(wrapped.setKey()).toBe(true);
      expect(wrapped.reifyMessage()).toBe('{"a":1}');
      expect(wrapped.getRequestContents()).toBe(contents);
      expect(wrapped.withMetadata()).toBeUndefined();
      expect(crashes).toHaveLength(1);
      expect(crashes[0]).toContain("at 'given'");
    });
  });
});
