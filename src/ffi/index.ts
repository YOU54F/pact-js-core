
import binary = require('@mapbox/node-pre-gyp');
import path from 'path'
import logger, { DEFAULT_LOG_LEVEL } from '../logger';
import { LogLevel } from '../logger/types';
import { Ffi } from './types';

const bindingPath = binary.find(path.resolve(path.join(__dirname,"../../package.json")));
// eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
const ffiLib:Ffi = require(bindingPath);

export const PACT_FFI_VERSION = '0.4.0';

let ffi: typeof ffiLib;
let ffiLogLevel: LogLevel;

const initialiseFfi = (logLevel: LogLevel): typeof ffi => {
  logger.debug(`Initalising native core at log level '${logLevel}'`);
  ffiLogLevel = logLevel;
  ffiLib.pactffiInitWithLogLevel(logLevel);

  return ffiLib;
};

export const getFfiLib = (
  logLevel: LogLevel = DEFAULT_LOG_LEVEL
): typeof ffi => {
  if (!ffi) {
    logger.trace('Initiliasing ffi for the first time');
    ffi = initialiseFfi(logLevel);
  } else {
    logger.trace('Ffi has already been initialised, no need to repeat it');
    if (logLevel !== ffiLogLevel) {
      logger.warn(
        `The pact native core has already been initialised at log level '${ffiLogLevel}'`
      );
      logger.warn(`The new requested log level '${logLevel}' will be ignored`);
    }
  }
  return ffi;
};
