import {
  type Ffi,
  type FfiPactHandle,
  FfiWritePactResponse,
} from '../ffi/types';
import { logCrashAndThrow, logErrorAndThrow } from '../logger';
import type { MatchingResult, Mismatch } from './types';

export const mockServerMismatches = (
  ffi: Ffi,
  port: number,
): MatchingResult[] => {
  const mismatches = ffi.pactffiMockServerMismatches(port);
  if (mismatches === null) {
    return logCrashAndThrow(
      `The pact core couldn't return the mismatches for the mock server on port ${port}. The mock server may have already been cleaned up, or the core panicked`,
    );
  }
  const results: MatchingResult[] = JSON.parse(mismatches);
  return results.map((result: MatchingResult) => ({
    ...result,
    ...('mismatches' in result
      ? {
          mismatches: result.mismatches.map((m: string | Mismatch) =>
            typeof m === 'string' ? JSON.parse(m) : m,
          ),
        }
      : {}),
  }));
};

export const writePact = (
  ffi: Ffi,
  pactPtr: FfiPactHandle,
  dir: string,
  merge = true,
  port = 0,
): void => {
  let result: FfiWritePactResponse;

  if (port) {
    result = ffi.pactffiWritePactFileByPort(port, dir, !merge);
  } else {
    result = ffi.pactffiWritePactFile(pactPtr, dir, !merge);
  }

  switch (result) {
    case FfiWritePactResponse['SUCCESS']:
      return;
    case FfiWritePactResponse['UNABLE_TO_WRITE_PACT_FILE']:
      logErrorAndThrow('The pact core was unable to write the pact file');
      break;
    case FfiWritePactResponse['GENERAL_PANIC']:
      logCrashAndThrow('The pact core panicked while writing the pact file');
      break;
    case FfiWritePactResponse['MOCK_SERVER_NOT_FOUND']:
      logCrashAndThrow(
        'The pact core was asked to write a pact file from a mock server that appears not to exist',
      );
      break;
    default:
      logCrashAndThrow(
        `The pact core returned an unknown error code (${result}) instead of writing the pact`,
      );
  }
};

export const reifyMessage = (ffi: Ffi, interactionPtr: number): string => {
  const reified = ffi.pactffiMessageReify(interactionPtr);
  if (reified === null) {
    return logCrashAndThrow(
      'The pact core was unable to reify the message. Check that the message contents are valid',
    );
  }
  return reified;
};
