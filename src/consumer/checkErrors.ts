import logger from '../logger';

const checkResult = (result: unknown, contextMessage: string): void => {
  if (typeof result !== 'boolean' && typeof result !== 'number') {
    return;
  }
  const failed = typeof result === 'number' ? result !== 0 : !result;
  if (failed) {
    logger.pactCrash(
      `The pact consumer core returned false at '${contextMessage}'. This\nshould only happen if the core methods were invoked out of order`,
    );
  }
};

export const wrapWithCheck =
  <F extends (...args: never[]) => boolean | number>(
    f: CheckableFunction<F>,
    contextMessage: string,
  ) =>
  (...args: Parameters<F>): ReturnType<F> => {
    const result = f(...args);
    checkResult(result, contextMessage);
    return result as ReturnType<F>;
  };

type CheckableFunction<T> = T extends (...args: infer A) => boolean | number
  ? (...args: A) => ReturnType<T>
  : never;

type CheckableFunctions<T> = {
  [key in keyof T]: CheckableFunction<T[key]>;
};

export const wrapAllWithCheck = <T extends CheckableFunctions<T>>(
  o: T,
): CheckableFunctions<T> =>
  (Object.keys(o) as Array<keyof T>)
    .map((key: keyof T) => ({
      [key]: wrapWithCheck(
        o[key] as CheckableFunction<T[keyof T]>,
        String(key),
      ),
    }))
    .reduce(
      (acc, curr) => Object.assign(acc, curr),
      {} as CheckableFunctions<T>,
    ) as T;

/**
 * Like `wrapAllWithCheck`, for objects whose functions don't all return a
 * status (such as messages, which also return contents). Boolean and numeric
 * results are checked; any other result is returned unchanged.
 */
export const wrapAllWithResultCheck = <
  T extends Record<string, (...args: never[]) => unknown>,
>(
  o: T,
): T =>
  Object.fromEntries(
    Object.entries(o).map(([key, f]) => [
      key,
      (...args: never[]) => {
        const result = f(...args);
        checkResult(result, key);
        return result;
      },
    ]),
  ) as T;
