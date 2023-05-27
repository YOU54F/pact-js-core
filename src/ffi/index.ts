import path from 'node:path';
import bindings = require('node-gyp-build');
import logger, { DEFAULT_LOG_LEVEL } from '../logger';
import { LogLevel } from '../logger/types';
import { Ffi } from './types';

export const PACT_FFI_VERSION = '0.4.0';

// supported prebuilds
// darwin-arm64
// darwin-x64
// linux-arm64
// linux-x64
// win32-x64

const supportedPlatforms = [
  'darwin-arm64',
  'darwin-x64',
  'linux-arm64',
  'linux-x64',
  'win32-x64',
];
const platform = `${process.platform}-${process.arch}`;

const supportedPlatformsMessage = [
  'Supported platforms are: ',
  ` - ${supportedPlatforms.join('\n - ')}`,
].join('\n');
const detectedMessage = `We detected your platform as: \n\n - ${platform}\n`;
logger.info(detectedMessage);
if (!supportedPlatforms.includes(platform)) {
  logger.warn(supportedPlatformsMessage);
  logger.warn(detectedMessage);
  logger.error(`Unsupported platform: ${platform}`);
  process.exit(1);
}

const loadPathMessage = (bindingsPath: string) =>
  `: loading native module from: \n\n - ${bindingsPath} ${
    process.env['PACT_NAPI_NODE_LOCATION']
      ? '\n - source: PACT_NAPI_NODE_LOCATION\n'
      : '\n   source: prebuilds \n\n - You can override via PACT_NAPI_NODE_LOCATION\n'
  }`;

const bindingsResolver = (bindingsPath: string | undefined) =>
  bindings(bindingsPath);

const bindingPaths = [
  path.resolve(
    process.env['PACT_NAPI_NODE_LOCATION']?.toString() ?? path.resolve()
  ),
];
let ffiLib: Ffi;
try {
  bindingPaths.forEach((bindingPath) => {
    try {
      logger.info(
        `Attempting to find pact native module ${loadPathMessage(bindingPath)}`
      );
      ffiLib = bindingsResolver(bindingPath);
      if (ffiLib) {
        throw new Error('Native module found');
      }
    } catch (error) {
      logger.warn(`Failed to load native module from ${bindingPath}: ${error}`);
    }
  });
} catch (error) {
  logger.debug(supportedPlatformsMessage);
  logger.debug(detectedMessage);
  logger.debug(`Failed ${loadPathMessage}`);
  logger.error(`Failed to load native module: ${error}`);
  process.exit(1);
}

let ffi: typeof ffiLib;
let ffiLogLevel: LogLevel;

const initialiseFfi = (logLevel: LogLevel): typeof ffi => {
  logger.debug(`Initalising native core at log level '${logLevel}'`);
  ffiLogLevel = logLevel;
  try {
    ffiLib.pactffiInitWithLogLevel(logLevel);
  } catch (error) {
    logger.debug(supportedPlatformsMessage);
    logger.debug(detectedMessage);
    logger.error(`Failed to initialise native module: ${error}`);
  }

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
